'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  useEffect(() => {
    const supabase = createClient()

    const test = async () => {
      const { data, error } = await supabase
        .from('your_table_name') // replace with a real table
        .select('*')

      console.log(data, error)
    }

    test()
  }, [])

  return <h1>Supabase Connected</h1>
}