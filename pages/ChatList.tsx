import { ConversationListItem } from ".";
import { useLongPress } from "use-long-press";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useState } from "react";
import { handleCopyImg } from "../utils/imageService";
import { saveImage } from "../services/saveImage";

interface Props {
  conversationList: ConversationListItem[];
  showLoading: () => void;
  hideLoading: () => void;
}
export default function ChatList(props: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [copyText, setCopyText] = useState<string>();
  const [isImage, setIsImage] = useState<boolean>(false);
  const longPress = useLongPress((e) => {
    e.preventDefault()
    // @ts-ignore
    if (e.target?.className === "img") {
      // @ts-ignore
      setCopyText(e.target?.currentSrc);
      setIsImage(true);
    } else {
      // @ts-ignore
      setCopyText(e.target?.innerText);
      setIsImage(false)
    }
    setOpen(true);
  }, {
    threshold: 1500,
    onStart: (e) => e.preventDefault(),
    onFinish: (e) => e.preventDefault(),
    onMove: (e) => e.preventDefault(),
  });
  const closeModal = () => {
    setOpen(false);
  };
  const copy = async () => {
    setOpen(false);
    props.showLoading()
    if (isImage) {
      const {url} = await handleSaveImg(copyText)
      await handleCopyImg(url, () => {}, 512, 512)
    } else {
      await navigator.clipboard.writeText(copyText);
    }
    props.hideLoading()
  };

  const handleSaveImg = async (imgUrl: string) => {
    const {result} = await saveImage(imgUrl)
    return result
  }
  const Modal = () => (
    <Popup open={open} closeOnDocumentClick onClose={closeModal}>
      <div className="menu">
        <div className="menu-item" onClick={copy}>
          复制
        </div>
      </div>
    </Popup>
  );
  return (
    <div className="container clearfix">
      <Modal />
      <div className="chat">
        <div className="chat-history">
          <ul>
            {props.conversationList?.map((message, index) => {
              if (message?.id || message?.choices?.[0]?.isImage) {
                return (
                  <li key={index} {...longPress()}>
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
                <li className="clearfix" key={index} {...longPress()}>
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
