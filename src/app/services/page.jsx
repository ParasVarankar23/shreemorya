import RouteSchedule from '@/components/services/RouteSchedule'
import ServiceHero from '@/components/services/ServiceHero'
import WhyChooseService from '@/components/services/WhyChooseService'
import React from 'react'

export default function page() {
  return (
    <div>
        <ServiceHero/>
        <RouteSchedule/>
        <WhyChooseService/>
    </div>
  )
}
