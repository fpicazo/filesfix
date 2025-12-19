import React from 'react'
import Sidebar from '../components/Sidebar'
import DashboardCards from '../shared/DashboardCards'
import PageHeader from '../components/PageHeader'

const Dashboard = () => {
  return (
   <PageHeader title="Dashboard"  >
      <main className="flex-1">
        <DashboardCards />
      </main>
   </PageHeader>
  )
}

export default Dashboard
