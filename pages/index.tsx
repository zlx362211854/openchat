import Head from "next/head";
import { useEffect, useState } from "react";
import { generate } from "../services/generate";
import styles from "./index.module.css";
import ChatList from "./ChatList";
import dog from "./dog.png";
import Image from "next/image";
import { draw } from "../services/draw";
import Popup from "reactjs-popup";
import { useLoading } from "../utils/hooks/useLoading";
type chatType = "chat" | "draw";
export interface ConversationListItem {
  choices: { text: string; isImage?: boolean }[];
  id?: string;
  date?: string;
  skipInGeneration?: boolean;
}
function formatDate(date: Date): string {
  if (!date || !(date instanceof Date)) return;
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const minutes = date.getMinutes();
  return `${y}-${m}-${d} ${h}:${minutes >= 10 ? minutes : "0" + minutes}`;
}
export default function Home() {
  const {loading, showLoading, hideLoading} = useLoading();
  const [needFetch, setNeedFetch] = useState<boolean>(false);
  const [chatType, setChatType] = useState<chatType>("chat");
  const [errorMessage, setErrorMessage] = useState("");
  const [questionInput, setquestionInput] = useState("");
  const [conversationList, setconversationList] = useState<
    ConversationListItem[]
  >([]);
  const [drawList, setdrawList] = useState<ConversationListItem[]>([]);

  useEffect(() => {
    if (chatType === "chat") {
      if (conversationList.length === 0) {
        let conversationListFromCache =
          localStorage.getItem("conversationList");
        try {
          if (conversationListFromCache) {
            setconversationList(JSON.parse(conversationListFromCache));
          }
        } catch (err) {
          console.error(
            "Incorrect conversationList during translating into json"
          );
        }
      }
    }
    if (chatType === "draw") {
      if (drawList.length === 0) {
        let drawListFromCache = localStorage.getItem("drawList");
        try {
          if (drawListFromCache) {
            setdrawList(JSON.parse(drawListFromCache));
          }
        } catch (err) {
          console.error(
            "Incorrect conversationList during translating into json"
          );
        }
      }
    }
  }, []);

  useEffect(() => {
    if (needFetch) {
      setquestionInput("");
      handleGenerate();
    }
  }, [needFetch]);

  useEffect(() => {
    setconversationListToCache();
    scrollToBottom();
  }, [conversationList?.length]);

  useEffect(() => {
    setdrawListToCache();
    scrollToBottom();
  }, [drawList?.length]);

  async function onSubmit(event) {
    event.preventDefault();
    if (!questionInput) return;
    if (chatType === "chat") {
      handleConversationSubmit();
    } else if (chatType === "draw") {
      handleDrawSubmit();
    }
  }

  function handleConversationSubmit() {
    const newList = conversationList.slice(0);
    newList.push({
      date: formatDate(new Date()),
      choices: [{ text: questionInput }],
    });
    showLoading();
    setconversationList(newList);
    setNeedFetch(true);
  }

  function handleDrawSubmit() {
    const newList = drawList.slice(0);
    newList.push({
      date: formatDate(new Date()),
      choices: [{ text: questionInput }],
    });
    showLoading();
    setdrawList(newList);
    setNeedFetch(true);
  }

  async function handleGenerate() {
    if (chatType === "chat") {
      await handleConversationListGenerate();
    } else if (chatType === "draw") {
      await handleDrawListGenerate();
    }
    setquestionInput("");
    hideLoading();
    setNeedFetch(false);
  }

  async function handleConversationListGenerate() {
    const list = conversationList.slice(0);
    const prompt = generatePrompt();
    const data = await generate(prompt);
    if (data.result) {
      list.push({
        ...data.result,
        date: formatDate(new Date()),
      });
      setconversationList(list);
      setErrorMessage("");
    }
    if (data.error) {
      setErrorMessage(data.error?.message);
    }
  }

  async function handleDrawListGenerate() {
    const list = drawList.slice(0);
    const prompt = generatePrompt();
    const data = await draw(prompt);
    if (data.result) {
      list.push({
        ...data.result,
        date: formatDate(new Date()),
      });
      setdrawList(list);
      setErrorMessage("");
    }
    if (data.error) {
      setErrorMessage(data.error?.message);
    }
  }

  function generatePrompt() {
    const str = reduceListLength(
      chatType === "chat" ? conversationList : drawList
    );
    return str;
  }

  function reduceListLength(list: ConversationListItem[]) {
    let index = 0;
    const QAS = list.map((i) => {
      return i.skipInGeneration
        ? ""
        : i?.id
        ? `${i.choices?.[0]?.text}\n`
        : `${i.choices?.[0]?.text}\n`;
    });
    const prompt = QAS?.join("")
      ?.replace(/ /g, "")
      ?.replace(/`{3}[^`]*`{3}/g, "");
    const maxTokens = prompt?.length;
    if (maxTokens >= 1000) {
      index++;
      list.splice(0, index);
      return reduceListLength(list);
    }
    return prompt;
  }

  function setconversationListToCache() {
    localStorage.setItem("conversationList", JSON.stringify(conversationList));
  }

  function setdrawListToCache() {
    localStorage.setItem("drawList", JSON.stringify(drawList));
  }

  function scrollToBottom() {
    if (!document || !window) return;
    const t = document.body.clientHeight;
    window.scroll({ top: t, behavior: "smooth" });
  }

  function clear() {
    if (chatType === "chat") {
      localStorage.removeItem("conversationList");
      setconversationList([]);
    }
    if (chatType === "draw") {
      localStorage.removeItem("drawList");
      setdrawList([]);
    }
  }

  function changeChatType(type: chatType) {
    setChatType(type);
  }

  const ErrorModal = () => (
    <Popup open={!!errorMessage} closeOnDocumentClick>
      <div className={styles.error}>{errorMessage}</div>
    </Popup>
  );
  return (
    <div>
      <Head>
        <title>Chat</title>
      </Head>
      <ErrorModal />
      <main className={styles.main}>
        <Image src={dog} className={styles.icon} alt="" />
        <h3>Chat with me</h3>
        <div className="tabs">
          <div
            className={`tab ${chatType === "chat" && "active"}`}
            onClick={() => changeChatType("chat")}
          >
            ??????
          </div>
          <div
            className={`tab ${chatType === "draw" && "active"}`}
            onClick={() => changeChatType("draw")}
          >
            ??????
          </div>
        </div>
        <ChatList
          conversationList={chatType === "chat" ? conversationList : drawList}
          showLoading={showLoading}
          hideLoading={hideLoading}
        />
        <div className="formContainer">
          <form className="form" onSubmit={onSubmit}>
            <textarea
              name="question"
              rows={2}
              placeholder="????????????????????????????????????????????????????????????"
              value={questionInput}
              onChange={(e) => setquestionInput(e.target.value)}
            />
            <input type="submit" value="??????" />
          </form>
        </div>
      </main>
      
      {loading && (
        <div className="cover">
          <div className="box">
            <div className="combox">
              <div className="loading"></div>
            </div>
          </div>
        </div>
      )}
      <div className="clear" onClick={clear}>
        ??????
      </div>
    </div>
  );
}
