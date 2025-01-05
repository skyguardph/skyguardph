'use client'
import { Card } from '@components/common/Card'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">
          Welcome to SkyGuard PH
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Professional Content Moderation Platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-light mb-3">
            Content Moderation
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Efficiently manage and moderate content with our advanced tools and features.
          </p>
        </Card>

        <Card variation="success" className="hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold text-secondary dark:text-secondary-light mb-3">
            Real-time Monitoring
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor content and user activity in real-time with comprehensive analytics.
          </p>
        </Card>

        <Card hint="important" className="hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-light mb-3">
            Community Guidelines
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Enforce community guidelines effectively with automated tools.
          </p>
        </Card>

        <Card variation="warning" className="hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-3">
            Report Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Handle user reports and feedback with our streamlined system.
          </p>
        </Card>

        <Card hint="info" className="hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold text-secondary dark:text-secondary-light mb-3">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Track moderation metrics and performance with detailed analytics.
          </p>
        </Card>

        <Card variation="error" className="hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-3">
            Violation Tracking
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Keep track of content violations and user infractions systematically.
          </p>
        </Card>
      </div>
    </div>
  )
}
