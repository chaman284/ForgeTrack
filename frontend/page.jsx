import { useEffect, useState } from 'react'
import { createClient } from './utils/supabase/client'

export default function Page() {
  const [todos, setTodos] = useState([])
  const supabase = createClient()

  useEffect(() => {
    const fetchTodos = async () => {
      const { data } = await supabase.from('todos').select()
      if (data) setTodos(data)
    }
    fetchTodos()
  }, [supabase])

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}
