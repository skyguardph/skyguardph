// TODO: This is badly named so that we can rebuild this component without breaking the old one
import { useQuery } from '@tanstack/react-query'
import {
  AtUri,
  ComAtprotoAdminDefs,
  ComAtprotoAdminEmitModerationEvent,
} from '@atproto/api'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { ActionPanel } from '@/common/ActionPanel'
import { ButtonPrimary, ButtonSecondary } from '@/common/buttons'
import { Checkbox, FormLabel, Input, Textarea } from '@/common/forms'
import { PropsOf } from '@/lib/types'
import client from '@/lib/client'
import { BlobList } from './BlobList'
import { queryClient } from 'components/QueryClient'
import {
  LabelChip,
  LabelList,
  LabelListEmpty,
  diffLabels,
  displayLabel,
  getLabelGroupInfo,
  getLabelsForSubject,
  toLabelVal,
  unFlagSelfLabel,
} from '@/common/labels'
import { FullScreenActionPanel } from '@/common/FullScreenActionPanel'
import { PreviewCard } from '@/common/PreviewCard'
import { useKeyPressEvent } from 'react-use'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { LabelSelector } from '@/common/labels/Grid'
import { takesKeyboardEvt } from '@/lib/util'
import { Loading } from '@/common/Loader'
import { ActionDurationSelector } from '@/reports/ModerationForm/ActionDurationSelector'
import { MOD_EVENTS } from '@/mod-event/constants'
import { ModEventList } from '@/mod-event/EventList'
import { ModEventSelectorButton } from '@/mod-event/SelectorButton'
import { createSubjectFromId } from '@/reports/helpers/subject'
import { SubjectReviewStateBadge } from '@/subject/ReviewStateMarker'
import { getProfileUriForDid } from '@/reports/helpers/subject'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const FORM_ID = 'mod-action-panel'

type Props = {
  subject: string
  setSubject: (subject: string) => void
  subjectOptions?: string[]
  isInitialLoading: boolean
  onSubmit: (
    vals: ComAtprotoAdminEmitModerationEvent.InputSchema,
  ) => Promise<void>
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function ModActionPanelQuick(
  props: PropsOf<typeof ActionPanel> & Props,
) {
  const {
    subject,
    setSubject,
    subjectOptions,
    onSubmit,
    onClose,
    isInitialLoading,
    ...others
  } = props
  return (
    <FullScreenActionPanel
      title={`Take moderation action`}
      onClose={onClose}
      {...others}
    >
      {!subjectOptions?.length ? (
        <div className="flex flex-col flex-1 h-full item-center justify-center">
          {isInitialLoading ? (
            <>
              <Loading />{' '}
              <p className="pb-4 text-center text-gray-400">
                Loading reports...
              </p>
            </>
          ) : (
            <>
              <CheckCircleIcon
                title="No reports"
                className="h-10 w-10 text-green-300 align-text-bottom mx-auto mb-4"
              />
              <p className="pb-4 text-center text-gray-400">No reports found</p>
            </>
          )}
        </div>
      ) : (
        <Form
          onCancel={onClose}
          onSubmit={onSubmit}
          subject={subject}
          setSubject={setSubject}
          subjectOptions={subjectOptions}
        />
      )}
    </FullScreenActionPanel>
  )
}

function Form(
  props: {
    onCancel: () => void
  } & Pick<Props, 'setSubject' | 'subject' | 'subjectOptions' | 'onSubmit'>,
) {
  const { subject, setSubject, subjectOptions, onCancel, onSubmit, ...others } =
    props
  const [submitting, setSubmitting] = useState(false)
  const { data: subjectStatus, refetch: refetchSubjectStatus } = useQuery({
    // subject of the report
    queryKey: ['modSubjectStatus', { subject }],
    queryFn: () => getSubjectStatus(subject),
  })
  const { data: { record, repo } = {}, refetch: refetchSubject } = useQuery({
    // subject of the report
    queryKey: ['modActionSubject', { subject }],
    queryFn: () => getSubject(subject),
  })
  const isSubjetDid = subject.startsWith('did:')

  const allLabels = getLabelsForSubject({ repo, record })
  const currentLabels = allLabels.map((label) =>
    toLabelVal(label, repo?.did ?? record?.repo.did),
  )
  const [modEventType, setModEventType] = useState<string>(
    MOD_EVENTS.ACKNOWLEDGE,
  )
  const isLabelEvent = modEventType === MOD_EVENTS.LABEL
  const isMuteEvent = modEventType === MOD_EVENTS.MUTE
  const isCommentEvent = modEventType === MOD_EVENTS.COMMENT
  const shouldShowDurationInHoursField =
    modEventType === MOD_EVENTS.TAKEDOWN || isMuteEvent

  // navigate to next or prev report
  const navigateQueue = (delta: 1 | -1) => {
    const len = subjectOptions?.length
    if (len) {
      // if we have a next report, go to it
      const currentSubjectIndex = subjectOptions.indexOf(subject)
      if (currentSubjectIndex !== -1) {
        const nextSubjectIndex = (currentSubjectIndex + len + delta) % len // loop around if we're at the end
        setSubject(subjectOptions[nextSubjectIndex])
      } else {
        setSubject(subjectOptions[0])
      }
    } else {
      // otherwise, just close the panel
      onCancel()
    }
  }
  // Left/right arrows to nav through report subjects
  const evtRef = useRef({ navigateQueue })
  useEffect(() => {
    evtRef.current = { navigateQueue }
  })
  useEffect(() => {
    const downHandler = (ev: WindowEventMap['keydown']) => {
      if (
        ev.key !== 'ArrowLeft' &&
        ev.key !== 'ArrowRight' &&
        ev.key !== 'ArrowDown' &&
        ev.key !== 'ArrowUp'
      ) {
        return
      }
      if (takesKeyboardEvt(ev.target)) {
        return
      }
      evtRef.current.navigateQueue(
        ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 1,
      )
    }
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])
  // on form submit
  const onFormSubmit = async (
    ev: FormEvent<HTMLFormElement> & { target: HTMLFormElement },
  ) => {
    ev.preventDefault()
    try {
      setSubmitting(true)
      const formData = new FormData(ev.currentTarget)
      const nextLabels = String(formData.get('labels'))!.split(',')
      const coreEvent: Parameters<typeof onSubmit>[0]['event'] = {
        $type: modEventType,
      }

      if (formData.get('durationInHours')) {
        coreEvent.durationInHours = Number(formData.get('durationInHours'))
      }

      if (formData.get('comment')) {
        coreEvent.comment = formData.get('comment')
      }

      if (formData.get('sticky')) {
        coreEvent.sticky = true
      }

      if (modEventType === MOD_EVENTS.LABEL) {
        const labels = diffLabels(currentLabels, nextLabels)
        coreEvent.createLabelVals = labels.createLabelVals
        coreEvent.negateLabelVals = labels.negateLabelVals
      }

      const subjectInfo = await createSubjectFromId(subject)

      await onSubmit({
        subject: subjectInfo,
        createdBy: client.session.did,
        subjectBlobCids: formData
          .getAll('subjectBlobCids')
          .map((cid) => String(cid)),
        event: coreEvent,
      })

      refetchSubjectStatus()
      refetchSubject()
      queryClient.invalidateQueries(['modEventList', { props: { subject } }])

      // After successful submission, reset the form state to clear inputs for previous submission
      ev.target.reset()
    } catch (err) {
      throw err
    } finally {
      setSubmitting(false)
    }
  }
  // Keyboard shortcuts for action types
  const submitButton = useRef<HTMLButtonElement>(null)
  const submitForm = () => {
    if (!submitButton.current) return
    submitButton.current.click()
  }
  useKeyPressEvent('c', safeKeyHandler(onCancel))
  useKeyPressEvent('s', safeKeyHandler(submitForm))
  useKeyPressEvent(
    'a',
    safeKeyHandler(() => {
      setModEventType(MOD_EVENTS.ACKNOWLEDGE)
    }),
  )
  useKeyPressEvent(
    'l',
    safeKeyHandler(() => {
      setModEventType(MOD_EVENTS.LABEL)
    }),
  )
  useKeyPressEvent(
    'e',
    safeKeyHandler(() => {
      setModEventType(MOD_EVENTS.ESCALATE)
    }),
  )
  useKeyPressEvent(
    't',
    safeKeyHandler(() => {
      setModEventType(MOD_EVENTS.TAKEDOWN)
    }),
  )

  return (
    <>
      {/* The inline styling is not ideal but there's no easy way to set calc() values in tailwind  */}
      {/* We are basically telling the browser to leave 180px at the bottom of the container to make room for navigation arrows and use the remaining vertical space for the main content where scrolling will be allowed if content overflows */}
      <div
        className="flex overflow-y-auto"
        style={{ height: 'calc(100vh - 180px)' }}
      >
        <form
          id={FORM_ID}
          onSubmit={onFormSubmit}
          {...others}
          className="flex w-1/2 flex-col"
        >
          <div className="flex flex-col">
            <div className="flex flex-row items-end mb-3">
              <FormLabel
                label="Subject"
                htmlFor="subject"
                className="flex-1"
                copyButton={{ text: subject, label: 'Copy subject' }}
                extraLabel={
                  <SubjectSwitchButton
                    subject={subject}
                    setSubject={setSubject}
                  />
                }
              >
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  list="subject-suggestions"
                  placeholder="Subject"
                  className="block w-full"
                  value={subject}
                  onChange={(ev) => setSubject(ev.target.value)}
                  autoComplete="off"
                />
                <datalist id="subject-suggestions">
                  {subjectOptions?.map((subject) => (
                    <option key={subject} value={subject} />
                  ))}
                </datalist>
              </FormLabel>
            </div>
            {/* PREVIEWS */}
            <div className="max-w-xl">
              <PreviewCard did={subject} />
            </div>

            {!!subjectStatus && (
              <div className="pb-4">
                <p>
                  <SubjectReviewStateBadge subjectStatus={subjectStatus} />

                  {subjectStatus.lastReviewedAt ? (
                    <span className="pl-1">
                      Last reviewed at:{' '}
                      {dateFormatter.format(
                        new Date(subjectStatus.lastReviewedAt),
                      )}
                    </span>
                  ) : (
                    <span className="pl-1">Not yet reviewed</span>
                  )}
                </p>
                {!!subjectStatus.comment && (
                  <p className="pt-1">
                    <strong>Note:</strong> {subjectStatus.comment}
                  </p>
                )}
              </div>
            )}

            {record?.blobs && (
              <FormLabel
                label="Blobs"
                className={`mb-3 ${subjectStatus ? 'opacity-75' : ''}`}
              >
                <BlobList
                  blobs={record.blobs}
                  name="subjectBlobCids"
                  disabled={false}
                />
              </FormLabel>
            )}
            <div className={`mb-3`}>
              <FormLabel label="Labels">
                <LabelList className="-ml-1">
                  {!currentLabels.length && <LabelListEmpty className="ml-1" />}
                  {currentLabels.map((label) => {
                    const labelGroup = getLabelGroupInfo(unFlagSelfLabel(label))

                    return (
                      <LabelChip
                        key={label}
                        style={{ color: labelGroup.color }}
                      >
                        {displayLabel(label)}
                      </LabelChip>
                    )
                  })}
                </LabelList>
              </FormLabel>
            </div>

            <div className="px-1">
              <div className="relative">
                <ModEventSelectorButton
                  subjectStatus={subjectStatus}
                  selectedAction={modEventType}
                  setSelectedAction={(action) => setModEventType(action)}
                />
              </div>
              {shouldShowDurationInHoursField && (
                <FormLabel
                  label=""
                  htmlFor="durationInHours"
                  className={`mb-3 mt-2`}
                >
                  <ActionDurationSelector
                    action={modEventType}
                    labelText={isMuteEvent ? 'Mute duration' : ''}
                  />
                </FormLabel>
              )}

              {isLabelEvent && (
                <FormLabel label="Labels" className="mt-2">
                  <LabelSelector
                    id="labels"
                    name="labels"
                    formId={FORM_ID}
                    subject={subject}
                    defaultLabels={currentLabels}
                  />
                </FormLabel>
              )}

              <div className="mt-2">
                <Textarea
                  name="comment"
                  placeholder="Reason for action (optional)"
                  className="block w-full mb-3"
                />
              </div>
              {isCommentEvent && (
                <Checkbox
                  value="true"
                  id="sticky"
                  name="sticky"
                  className="mb-3 flex items-center"
                  label="Update the subject's persistent note with this comment"
                />
              )}

              {/* Only show this when moderator tries to apply labels to a DID subject */}
              {isLabelEvent && isSubjetDid && (
                <p className="mb-3 text-xs">
                  Applying labels to an account has severe impact so, you
                  probably want to apply the labels to the user&apos;s profile
                  instead.{' '}
                  <a
                    href="#"
                    className="underline"
                    onClick={() => setSubject(getProfileUriForDid(subject))}
                  >
                    Please click here to switch the subject to profile record.
                  </a>
                </p>
              )}

              <div className="mt-auto">
                <ButtonSecondary
                  className="px-0 sm:px-4 sm:mr-2"
                  disabled={submitting}
                  onClick={onCancel}
                >
                  <span className="-rotate-90 sm:rotate-0 text-sm sm:text-base">
                    (C)ancel
                  </span>
                </ButtonSecondary>
                <ButtonPrimary
                  ref={submitButton}
                  type="submit"
                  disabled={submitting}
                  className="mx-1 px-0 sm:px-4"
                >
                  <span className="-rotate-90 sm:rotate-0 text-sm sm:text-base">
                    (S)ubmit
                  </span>
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </form>
        <div className="w-1/2 pl-4">
          <ModEventList subject={subject} />
        </div>
      </div>
      <div className="flex justify-between mt-auto">
        <ButtonSecondary
          onClick={() => navigateQueue(-1)}
          disabled={submitting}
        >
          <ArrowLeftIcon className="h-4 w-4 inline-block align-text-bottom" />
        </ButtonSecondary>

        <ButtonSecondary onClick={() => navigateQueue(1)} disabled={submitting}>
          <ArrowRightIcon className="h-4 w-4 inline-block align-text-bottom" />
        </ButtonSecondary>
      </div>
    </>
  )
}

const SubjectSwitchButton = ({
  subject,
  setSubject,
}: {
  subject: string
  setSubject: (s: string) => void
}) => {
  const isSubjectDid = subject.startsWith('did:')
  const text = isSubjectDid ? 'Switch to profile' : 'Switch to account'
  return (
    <button
      className="ml-2 text-xs text-gray-500 underline"
      onClick={(e) => {
        e.preventDefault()
        const newSubject = isSubjectDid
          ? getProfileUriForDid(subject)
          : new AtUri(subject).host
        setSubject(newSubject)
      }}
    >
      {text}
    </button>
  )
}

async function getSubject(subject: string) {
  if (subject.startsWith('did:')) {
    const { data: repo } = await client.api.com.atproto.admin.getRepo(
      { did: subject },
      { headers: client.adminHeaders() },
    )
    return { repo }
  } else if (subject.startsWith('at://')) {
    const { data: record } = await client.api.com.atproto.admin.getRecord(
      { uri: subject },
      { headers: client.adminHeaders() },
    )
    return { record }
  } else {
    return {}
  }
}

async function getSubjectStatus(subject: string) {
  const {
    data: { subjectStatuses },
  } = await client.api.com.atproto.admin.queryModerationStatuses(
    { subject, includeMuted: true, limit: 1 },
    { headers: client.adminHeaders() },
  )
  return subjectStatuses.at(0) || null
}

function isMultiPress(ev: KeyboardEvent) {
  return ev.metaKey || ev.shiftKey || ev.ctrlKey || ev.altKey
}

function safeKeyHandler(handler: (_ev: KeyboardEvent) => void) {
  return (ev: KeyboardEvent) => {
    if (!takesKeyboardEvt(ev.target) && !isMultiPress(ev)) {
      handler(ev)
    }
  }
}
