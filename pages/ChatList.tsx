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
              if (message?.id) {
                return (
                  <li key={index}>
                    <div className="message-data">
                      <span className="message-data-name">
                        <i className="fa fa-circle online"></i> GPT
                      </span>
                      <span className="message-data-time">
                        {message?.date}
                      </span>
                    </div>
                    <div className="message my-message">
                      {message?.choices?.[0].text}
                    </div>
                  </li>
                );
              }
              return (
                <li className="clearfix" key={index}>
                  <div className="message-data align-right">
                    <span className="message-data-name">Me</span>{" "}
                    <i className="fa fa-circle me"></i>
                    <span className="message-data-time">
                      {message?.date}
                    </span>
                  </div>
                  <div className="message my-message other-message float-right">
                    {message?.choices?.[0].text}
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
