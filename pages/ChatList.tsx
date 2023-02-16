import { ConversationListItem } from ".";

interface Props {
  conversationList: ConversationListItem[];
}
export default function ChatList(props: Props) {
  return (
    <div className="container clearfix">
      <div className="chat">
        <div className="chat-history">
          <ul>
            {props.conversationList?.map((message, index) => {
              if (message?.id || message?.choices?.[0]?.isImage) {
                return (
                  <li key={index}>
                    <div className="message-data">
                      <span className="message-data-name">
                        <i className="fa fa-circle online"></i> AI:
                      </span>
                      <span className="message-data-time">{message?.date}</span>
                    </div>
                    <div className="message my-message">
                      {!message?.choices?.[0]?.isImage ? (
                        <span>{message?.choices?.[0].text}</span>
                      ) : (
                        <img
                          className="img"
                          src={message?.choices?.[0]?.text}
                          alt=""
                        />
                      )}
                    </div>
                  </li>
                );
              }
              return (
                <li className="clearfix" key={index}>
                  <div className="message-data align-right">
                    <span className="message-data-name">我:</span>{" "}
                    <i className="fa fa-circle me"></i>
                    <span className="message-data-time">{message?.date}</span>
                  </div>
                  <div className="message my-message other-message float-right">
                    <span>{message?.choices?.[0].text}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
