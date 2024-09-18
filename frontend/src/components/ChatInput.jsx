import PropTypes from 'prop-types';

const ChatInput = ({sendChat}) => {
   const handleKeyDown = (e) => {
      if (e.code === "Enter") {
         sendChat(e.target.value);
         e.target.value = "";
      }
   };

   return (
      <div id="chat-input" style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
            <input type="text" placeholder="Enter your message..." onKeyDown={handleKeyDown}/>
            <button>Send</button>
      </div>
   )
}

ChatInput.propTypes = {
  sendChat: PropTypes.func.isRequired,
};

export default ChatInput