import PropTypes from 'prop-types'

const Chat = ({text}) => {
  return (
      <div id="chat" style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
        <p>{text}</p>
      </div>
  )
}

Chat.propTypes = {
  text: PropTypes.string.isRequired,
};

export default Chat