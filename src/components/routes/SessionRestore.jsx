import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetCurrentUserQuery } from '../../redux/services/authApi'
import { setUser } from '../../redux/slices/authSlice'

/**
 * Restores the logged-in user on ANY page after a reload, not only inside
 * dashboard routes. Without this, public pages (e.g. Pricing) treated a
 * logged-in customer as a visitor and showed "Sign up" instead of the checkout.
 * A 401 just means "not logged in" and leaves the state alone.
 */
export default function SessionRestore() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { data } = useGetCurrentUserQuery(undefined, { skip: isAuthenticated })

  useEffect(() => {
    if (data?.user && !isAuthenticated) {
      dispatch(setUser({ user: data.user, providerProfile: data.providerProfile }))
    }
  }, [data, isAuthenticated, dispatch])

  return null
}
