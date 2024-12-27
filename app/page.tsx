"use client"
import Image from "next/image"
import f1gpt from "./assets/f1gpt.png"
import { useChat } from "ai/react"
import { Message } from "ai"

const Home = () => {
    const { messages } = useChat();
    const noMessages = messages.length === 0;

    return (
        <main>
            <Image src={f1gpt} width="250" alt="F1GPT Logo" />
            <section>
                {noMessages ? (
                    <p className="starter-text">
                        The Ultimate place for Formula One super fans!
                        Ask F1GPT anything about the fantastic topic of F1 racing
                        and it will come back with the most up-to-date answers.
                        We hope you enjoy!
                    </p>
                ) : (
                    <div>
                        {/* Render messages here */}
                    </div>
                )}
                <br/>
            </section>
        </main>
    );
}

export default Home;