import { useState } from 'react'
import { client } from '~/utils/client'
import './Login.css'
import Loading from '../Loading/Loading'

function Login({ setApiKey }) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function getApiKey(email) {
    try {
      const { data } = await client.get('/api-key', { email })
      return data
    } catch (e) {
      throw new Error(e.message)
    }
  }
  const handleSubmit = (e) => {
    setLoading(true)
    e.preventDefault()
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (emailRegex.test(value)) {
      getApiKey(value).then((res) => {
        if (res.code === 200) {
          const apiKey = res.data.apiKey
          setApiKey(apiKey)
          localStorage.setItem('apiKey', apiKey)
          localStorage.setItem('email', value)
        } else {
          setError('Email không chính xác!')
          localStorage.removeItem('apiKey')
          localStorage.removeItem('email')
        }
        setLoading(false)
      })
    }
  }
  return (
    <div className='login'>
      <form
        method='post'
        className='form-login'
        onSubmit={handleSubmit}
      >
        <label htmlFor='email'>Email</label>
        <input
          type='email'
          required
          id='email'
          placeholder='example@gmail.com'
          onChange={(e) => setValue(e.target.value)}
        />
        <p className='error'>{error}</p>
        <button>submit</button>
      </form>
      {loading && <Loading />}
    </div>
  )
}

export default Login
