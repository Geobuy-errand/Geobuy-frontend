// components/Logo.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/geobuy-logo.png'

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center shrink-0"
      aria-label="GEOBUY Errands home"
    >
      <img
        src={logo}
        alt="GEOBUY Errands"
        className="
          h-9
          w-auto
          object-contain
          sm:h-10
          md:h-11
          lg:h-12
        "
      />
    </Link>
  )
}

export default Logo