import Head from "next/head";
import { useEffect, useState } from "react";
import { generate } from "../services/generate";
import styles from "./index.module.css";
import ChatList from "./ChatList";
import dog from './dog.png'
import Image from 'next/image'
export interface ConversationListItem {
  choices: { text: string }[];
  id?: string;
  date?: string
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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [questionInput, setquestionInput] = useState("");
  const [conversationList, setconversationList] = useState<
    ConversationListItem[]
  >([]);

  useEffect(() => {
    if (conversationList.length === 0) {
      let conversationListFromCache = localStorage.getItem("conversationList");
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
  }, []);

  useEffect(() => {
    if (loading) {
      setquestionInput('')
      handleGenerate();
    }
  }, [loading]);

  useEffect(() => {
    setconversationListToCache();
    scrollToBottom();
  }, [conversationList?.length]);

  async function onSubmit(event) {
    event.preventDefault();
    if (!questionInput) return;
    const newList = conversationList.slice(0);
    newList.push({
      date: formatDate(new Date()),
      choices: [{ text: questionInput }],
    });
    setLoading(true);
    setconversationList(newList);
  }

  async function handleGenerate() {
    const newList = conversationList.slice(0);
    const prompt = generatePrompt();
    const data = await generate(prompt);
    if (data.result) {
      newList.push({
        ...data.result,
        date: formatDate(new Date())
      });
      setconversationList(newList);
      setErrorMessage("");
    }
    if (data.error) {
      setErrorMessage(data.error?.message);
    }
    setquestionInput("");
    setLoading(false);
  }

  function generatePrompt() {
    const str = reduceConversationListLength(conversationList);
    return str;
  }

  function reduceConversationListLength(conversationList) {
    let index = 0;
    const QAS = conversationList.map((i) =>
      i?.id ? `${i.choices?.[0]?.text}\n` : `${i.choices?.[0]?.text}\n`
    );
    const prompt = QAS?.join("")
      ?.replace(/ /g, "")
      ?.replace(/`{3}[^`]*`{3}/g, "");
    const maxTokens = prompt?.length;
    if (maxTokens >= 1000) {
      index++;
      conversationList.splice(0, index);
      return reduceConversationListLength(conversationList);
    }
    return prompt;
  }

  function setconversationListToCache() {
    localStorage.setItem("conversationList", JSON.stringify(conversationList));
  }

  function scrollToBottom() {
    if (!document || !window) return;
    const t = document.body.clientHeight;
    window.scroll({ top: t, behavior: "smooth" });
  }

  function clear() {
    localStorage.removeItem("conversationList");
    setconversationList([])
  }
  return (
    <div>
      <Head>
        <title>Chat</title>
      </Head>
      <main className={styles.main}>
        <Image src={dog} className={styles.icon} alt="" />
        <h3>Chat with me</h3>
        <ChatList conversationList={conversationList} />
        <form className="form" onSubmit={onSubmit}>
          <input
            type="text"
            name="question"
            placeholder="Enter a question"
            value={questionInput}
            onChange={(e) => setquestionInput(e.target.value)}
          />
          <input type="submit" value="Send" />
        </form>
      </main>
      <div className={styles.error}>{errorMessage}</div>
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
        Clear
      </div>
    </div>
  );
}
