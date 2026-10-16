'use client';

import { useState } from 'react';
import { sampleAnswers } from './data';
export default function AccountingDemo() {
  const [messages, setMessages] = useState([]);
  return (
    <div className="demo">
      <div className="demobar">
        <span>✳ &nbsp; Accounting assistant</span>
        <span className="demobadge">GUIDED PREVIEW · NO LIVE AI</span>
      </div>
      <div className="conversation" aria-live="polite">
        <div className="message assistant">
          <span>ASSISTANT</span>
          <p>
            Explore an example conversation. Choose a question below to see a prepared educational
            response.
          </p>
        </div>
        {messages.map((message, index) => (
          <div key={index} className={'message ' + message.role}>
            <span>{message.role === 'user' ? 'YOU' : 'ASSISTANT'}</span>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="promptoptions">
        {sampleAnswers.map(([question, answer]) => (
          <button
            key={question}
            onClick={() =>
              setMessages((currentMessages) => [
                ...currentMessages,
                {
                  role: 'user',
                  text: question,
                },
                {
                  role: 'assistant',
                  text: answer,
                },
              ])
            }
          >
            {question}
            <span>↗</span>
          </button>
        ))}
      </div>
      <button className="textbutton resetconversation" onClick={() => setMessages([])}>
        Reset conversation
      </button>
    </div>
  );
}
