import Head from "next/head";
import { useEffect, useState } from "react";
import { generate } from "../services/generate";
import styles from "./index.module.css";
import ChatList from "./ChatList";
interface ConversationListItem {
  choices: { text: string }[];
  id?: string;
}
export default function Home() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
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
      handleGenerate();
    }
  }, [loading]);

  useEffect(() => {
    setconversationListToCache();
  }, [conversationList?.length]);

  async function onSubmit(event) {
    event.preventDefault();
    const newList = conversationList.slice(0);
    newList.push({
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
      newList.push(data.result);
      setconversationList(newList);
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
  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>
      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Chat with me</h3>
        <ChatList conversationList={conversationList} />
        <form onSubmit={onSubmit}>
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
    </div>
  );
}
