import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const EmojiPickerContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const EmojiButton = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 10px;
  padding: 10px 12px;
  color: #e6e6e6;
  cursor: pointer;
  font-size: 20px;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmojiPickerDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(12, 12, 14, 0.95);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 12px;
  padding: 12px;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(110, 86, 207, 0.2);
  padding-bottom: 8px;
`;

const CategoryTab = styled.button`
  background: ${p => p.$active ? 'rgba(110, 86, 207, 0.2)' : 'transparent'};
  border: 1px solid ${p => p.$active ? 'rgba(110, 86, 207, 0.4)' : 'rgba(110, 86, 207, 0.2)'};
  border-radius: 8px;
  padding: 6px 10px;
  color: #c6b9ff;
  font-size: 12px;
  cursor: pointer;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
`;

const EmojiItem = styled.button`
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(110, 86, 207, 0.2);
  }
`;

const emojiCategories = {
  faces: {
    name: 'Faces',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐']
  },
  people: {
    name: 'People',
    emojis: ['👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴', '👵', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👱', '👱‍♀️', '👱‍♂️', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲', '🧔', '👵', '👴', '👲', '👳', '👳‍♀️', '👳‍♂️', '🧕', '👮', '👮‍♀️', '👮‍♂️', '👷', '👷‍♀️', '👷‍♂️', '💂', '💂‍♀️', '💂‍♂️', '🕵️', '🕵️‍♀️', '🕵️‍♂️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓', '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭', '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨', '👩‍🚒', '👨‍🚒', '👩‍✈️', '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️', '🤶', '🎅', '👸', '🤴', '👰', '🤵', '👼', '🤰', '🙇', '🙇‍♀️', '🙇‍♂️', '💁', '💁‍♀️', '💁‍♂️', '🙅', '🙅‍♀️', '🙅‍♂️', '🙆', '🙆‍♀️', '🙆‍♂️', '🙋', '🙋‍♀️', '🙋‍♂️', '🧏', '🧏‍♀️', '🧏‍♂️', '🙎', '🙎‍♀️', '🙎‍♂️', '🙍', '🙍‍♀️', '🙍‍♂️', '💇', '💇‍♀️', '💇‍♂️', '💆', '💆‍♀️', '💆‍♂️', '🧖', '🧖‍♀️', '🧖‍♂️', '💃', '🕺', '👯', '👯‍♀️', '👯‍♂️', '🧘', '🧘‍♀️', '🧘‍♂️', '🛀', '🛌', '👭', '👫', '👬', '💏', '💑', '👪', '🗣️', '👤', '👥', '🫂']
  },
  activities: {
    name: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🏋️‍♀️', '🏋️‍♂️', '🤼', '🤼‍♀️', '🤼‍♂️', '🤸', '🤸‍♀️', '🤸‍♂️', '⛹️', '⛹️‍♀️', '⛹️‍♂️', '🤺', '🤾', '🤾‍♀️', '🤾‍♂️', '🏌️', '🏌️‍♀️', '🏌️‍♂️', '🏇', '🧘', '🧘‍♀️', '🧘‍♂️', '🏄', '🏄‍♀️', '🏄‍♂️', '🏊', '🏊‍♀️', '🏊‍♂️', '🤽', '🤽‍♀️', '🤽‍♂️', '🚣', '🚣‍♀️', '🚣‍♂️', '🧗', '🧗‍♀️', '🧗‍♂️', '🚵', '🚵‍♀️', '🚵‍♂️', '🚴', '🚴‍♀️', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🤹‍♀️', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄', '🎴', '🎯', '🎳', '🎮', '🎰', '🧩']
  },
  objects: {
    name: 'Objects',
    emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '🧮', '🎥', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '💴', '💵', '💶', '💷', '💸', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛏️', '🛋️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🏹', '🛡️', '🔧', '🔩', '⚙️', '🧱', '⛓️', '🧲', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛏️', '🛋️', '🪞', '🪟', '🛍️', '🛒']
  },
  nature: {
    name: 'Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦍', '🦧', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦏', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '⭐', '🌟', '💫', '✨', '☄️', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️']
  },
  food: {
    name: 'Food',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫒', '🌽', '🥕', '🫑', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥙', '🥚', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂']
  }
};

/**
 * EmojiPicker - A customizable emoji picker component
 * @param {Function} onEmojiSelect - Callback function called when an emoji is selected
 * @param {string} selectedEmoji - Currently selected emoji to display (default: '🙂')
 */
function EmojiPicker({ onEmojiSelect, selectedEmoji = '🙂' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('faces');
  const containerRef = useRef(null);

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <EmojiPickerContainer ref={containerRef}>
      <EmojiButton onClick={() => setIsOpen(!isOpen)}>
        {selectedEmoji}
      </EmojiButton>
      
      {isOpen && (
        <EmojiPickerDropdown>
          <CategoryTabs>
            {Object.keys(emojiCategories).map(categoryKey => (
              <CategoryTab
                key={categoryKey}
                $active={activeCategory === categoryKey}
                onClick={() => setActiveCategory(categoryKey)}
              >
                {emojiCategories[categoryKey].name}
              </CategoryTab>
            ))}
          </CategoryTabs>
          
          <EmojiGrid>
            {emojiCategories[activeCategory].emojis.map((emoji, index) => (
              <EmojiItem
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                title={emoji}
              >
                {emoji}
              </EmojiItem>
            ))}
          </EmojiGrid>
        </EmojiPickerDropdown>
      )}
    </EmojiPickerContainer>
  );
}

export default EmojiPicker;
