import React, { useState, useRef, useEffect } from 'react'
import { FaSmile, FaSearch, FaTimes } from 'react-icons/fa'

const EMOJI_CATEGORIES = {
  '😀': 'Smileys',
  '❤️': 'Love',
  '👍': 'Gestures',
  '🏠': 'Places',
  '📦': 'Objects',
  '🏥': 'Services',
  '🔧': 'Tools',
  '💼': 'Work',
  '👤': 'People',
  '🎨': 'Arts',
  '🏃': 'Activities',
  '🍕': 'Food',
  '🚗': 'Transport',
  '📋': 'Other'
}

const EMOJIS = {
  'Smileys': ['😀', '😊', '😎', '🤗', '😍', '🥰', '😘', '😁', '😂', '🤣', '😅', '😆', '😇', '😉', '😋', '😜', '🤪', '😝', '🤗', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '😲', '😳', '🙁', '😤', '😢', '😭', '😱', '😓', '🤯', '🥳', '🥺', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺'],
  'Love': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💕', '💞', '💓', '💗', '💖', '❤️‍🔥', '💔', '❤️‍🩹', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️'],
  'Gestures': ['👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤟', '🤘', '👌', '🤞', '🖕', '🖐️', '✋', '🤚', '👋', '🤏', '🫵', '💪', '🦾', '🖖'],
  'Places': ['🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🕍', '🛕', '⛩️', '🌆', '🌇', '🌃', '🎑', '🏞️', '🏔️', '🌋', '🏕️', '🏖️', '🏜️', '🌄', '🌅', '🌉', '🌊', '🌁'],
  'Objects': ['📦', '📦', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📝', '📄', '📃', '📑', '📊', '📈', '📉', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗂️', '🗃️', '🗄️', '🗑️', '🔍', '🔎', '🔏', '🔐', '🔑', '🗝️', '🔨', '🪚', '🔧', '🔩', '⚙️', '🔗', '🧰', '🧲', '🪛', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🔮', '🪄', '💈'],
  'Services': ['🏥', '💊', '🩺', '🦷', '👨‍⚕️', '👩‍⚕️', '🩻', '🩸', '💉', '🩹', '🏪', '💳', '💵', '💰', '🪪', '📋', '📝', '🕒', '📅', '📆', '⏰', '⏳', '⌛', '🔄', '✅', '❌', '⭕', '🆗', '🆘', 'ℹ️', '🔞', '🚫', '⛔', '❕', '❔', '❗', '⁉️'],
  'Tools': ['🔧', '🔨', '⚒️', '🛠️', '🗜️', '🔩', '⚙️', '🧰', '🪛', '🪚', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️'],
  'Work': ['💼', '👔', '👗', '👘', '🧥', '🧦', '🧤', '🧣', '👒', '🎩', '🧢', '⛑️', '👑', '💍', '🧳', '📁', '📂', '🗂️', '📅', '📆', '📇', '📋', '📌', '📍', '✒️', '🖊️', '🖋️', '✏️', '🖍️', '🖌️', '🔏', '🔐', '🔑'],
  'People': ['👤', '👥', '🧑', '👨', '👩', '🧔', '👱', '👴', '👵', '🧓', '👶', '🧒', '🧑‍🦰', '🧑‍🦱', '🧑‍🦳', '🧑‍🦲', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍⚖️', '👨‍⚖️', '👩‍⚖️', '🧑‍🌾', '👨‍🌾', '👩‍🌾', '🧑‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍🔧', '👨‍🔧', '👩‍🔧', '🧑‍🏭', '👨‍🏭', '👩‍🏭', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🔬', '👨‍🔬', '👩‍🔬', '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🎤', '👨‍🎤', '👩‍🎤', '🧑‍🎨', '👨‍🎨', '👩‍🎨', '🧑‍✈️', '👨‍✈️', '👩‍✈️', '🧑‍🚀', '👨‍🚀', '👩‍🚀', '🧑‍🚒', '👨‍🚒', '👩‍🚒', '👮', '👮‍♂️', '👮‍♀️', '🕵️', '🕵️‍♂️', '🕵️‍♀️', '💂', '💂‍♂️', '💂‍♀️', '👷', '👷‍♂️', '👷‍♀️', '👳', '👳‍♂️', '👳‍♀️', '👲', '🧕', '👰', '👰‍♂️', '👰‍♀️', '🤵', '🤵‍♂️', '🤵‍♀️', '👸', '🤴', '🦸', '🦸‍♂️', '🦸‍♀️', '🦹', '🦹‍♂️', '🦹‍♀️', '🧙', '🧙‍♂️', '🧙‍♀️', '🧚', '🧚‍♂️', '🧚‍♀️', '🧛', '🧛‍♂️', '🧛‍♀️', '🧜', '🧜‍♂️', '🧜‍♀️', '🧝', '🧝‍♂️', '🧝‍♀️', '🧞', '🧞‍♂️', '🧞‍♀️', '🧟', '🧟‍♂️', '🧟‍♀️'],
  'Arts': ['🎨', '🖌️', '🖍️', '✏️', '📝', '📖', '📚', '📕', '📗', '📘', '📙', '📔', '📓', '📒', '📃', '📄', '📑', '🎭', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🥁', '🎸', '🎺', '🎻', '🪗', '🎬', '📽️', '🎞️', '📺', '📷', '📸', '📹', '🎥', '🎦', '🎯', '🎮', '🎲', '🧩', '♟️', '🎪'],
  'Activities': ['🏃', '🏃‍♂️', '🏃‍♀️', '🚶', '🚶‍♂️', '🚶‍♀️', '🧎', '🧎‍♂️', '🧎‍♀️', '🏋️', '🏋️‍♂️', '🏋️‍♀️', '🤸', '🤸‍♂️', '🤸‍♀️', '⛹️', '⛹️‍♂️', '⛹️‍♀️', '🤾', '🤾‍♂️', '🤾‍♀️', '🏌️', '🏌️‍♂️', '🏌️‍♀️', '🏄', '🏄‍♂️', '🏄‍♀️', '🏊', '🏊‍♂️', '🏊‍♀️', '🤽', '🤽‍♂️', '🤽‍♀️', '🚣', '🚣‍♂️', '🚣‍♀️', '🧗', '🧗‍♂️', '🧗‍♀️', '🚴', '🚴‍♂️', '🚴‍♀️', '🚵', '🚵‍♂️', '🚵‍♀️', '🪂', '🏇', '⛷️', '🏂', '🎿', '⛸️', '🧘', '🧘‍♂️', '🧘‍♀️', '🧖', '🧖‍♂️', '🧖‍♀️', '🛀', '🛌'],
  'Food': ['🍕', '🍔', '🍟', '🌭', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥓', '🥩', '🍗', '🍖', '🦴', '🥪', '🥨', '🥯', '🥖', '🍞', '🥐', '🧇', '🥞', '🧈', '🧀', '🍅', '🍆', '🥑', '🫑', '🌽', '🥕', '🥦', '🥬', '🥒', '🌶️', '🫘', '🥜', '🌰', '🍄', '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾'],
  'Transport': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛴', '🛵', '🏍️', '🛺', '🚲', '🦽', '🦼', '🚨', '🚔', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚁', '🚀', '🛸', '🚢', '⛵', '🛥️', '🚤', '🛳️', '⚓'],
  'Other': ['📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗂️', '🗃️', '🗄️', '🗑️', '🔍', '🔎', '🔏', '🔐', '🔑', '🗝️', '🔨', '🪚', '🔧', '🔩', '⚙️', '🔗', '🧰', '🧲', '🪛', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🔮', '🪄', '💈', '💊', '🩺', '🦷', '🩻', '🩸', '💉', '🩹', '🧬', '🩼', '🩺', '💊', '🧫', '🧪']
}

const EmojiPicker = ({ onSelect, onClose, selectedEmoji }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Smileys')
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
        if (onClose) onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Get filtered emojis
  const getFilteredEmojis = () => {
    if (!searchTerm) {
      return EMOJIS[activeCategory] || []
    }
    const allEmojis = Object.values(EMOJIS).flat()
    return allEmojis.filter(emoji => 
      emoji === searchTerm || 
      emoji.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEmojiName(emoji).toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Get emoji name (simple mapping for search)
  const getEmojiName = (emoji) => {
    const names = {
      '😀': 'smile', '😊': 'blush', '😎': 'cool', '❤️': 'heart', '💕': 'love',
      '👍': 'thumbs up', '👎': 'thumbs down', '👏': 'clap', '🙌': 'celebration',
      '🏠': 'house', '🏢': 'office', '🏥': 'hospital', '🏦': 'bank',
      '📦': 'package', '📪': 'mailbox', '📫': 'mail', '📬': 'mail',
      '💼': 'briefcase', '👔': 'tie', '👗': 'dress', '👘': 'kimono',
      '🔧': 'wrench', '🔨': 'hammer', '⚒️': 'tools', '🛠️': 'tools',
      '🎨': 'art', '📝': 'memo', '📋': 'clipboard', '📌': 'pin',
      '🚗': 'car', '🚕': 'taxi', '🚙': 'suv', '🚌': 'bus',
      '🍕': 'pizza', '🍔': 'burger', '🍟': 'fries', '🌭': 'hotdog',
    }
    return names[emoji] || emoji
  }

  const handleEmojiSelect = (emoji) => {
    onSelect(emoji)
    setIsOpen(false)
    if (onClose) onClose()
  }

  return (
    <div className="relative" ref={pickerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 text-2xl bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-primary transition-colors flex items-center justify-center"
      >
        {selectedEmoji || <FaSmile className="text-gray-400 text-xl" />}
      </button>

      {/* Emoji Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 w-80 md:w-96 max-h-[400px] overflow-hidden">
          {/* Header with Search */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search emojis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          {!searchTerm && (
            <div className="flex overflow-x-auto px-3 py-2 gap-1 border-b border-gray-100 scrollbar-thin scrollbar-thumb-gray-300">
              {Object.keys(EMOJI_CATEGORIES).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setActiveCategory(EMOJI_CATEGORIES[emoji])}
                  className={`flex-shrink-0 p-2 rounded-lg text-lg transition-colors ${
                    activeCategory === EMOJI_CATEGORIES[emoji]
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'hover:bg-gray-100'
                  }`}
                  title={EMOJI_CATEGORIES[emoji]}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Grid */}
          <div className="p-3 overflow-y-auto max-h-64">
            {searchTerm && (
              <p className="text-xs text-gray-400 mb-2">
                {getFilteredEmojis().length} results found
              </p>
            )}
            <div className="grid grid-cols-8 gap-1">
              {getFilteredEmojis().map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`p-2 text-2xl hover:bg-gray-100 rounded-lg transition-colors ${
                    selectedEmoji === emoji ? 'bg-primary/10 ring-2 ring-primary' : ''
                  }`}
                  title={getEmojiName(emoji)}
                >
                  {emoji}
                </button>
              ))}
              {getFilteredEmojis().length === 0 && (
                <div className="col-span-8 text-center py-8 text-gray-400">
                  <p>No emojis found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {selectedEmoji ? `Selected: ${selectedEmoji}` : 'Select an emoji'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmojiPicker