import { useCallback, useEffect, useRef, useState } from "react";
import "./contactChat.css";

const DAVIT_TELEGRAM_URL = "https://t.me/pedanyan";
const CHAT_AVATAR = "/hero-frames/avatar.webp";

export type ChatIntent = {
  id: string;
  chip: string;
  said: string;
  reply: string;
  placeholder: string;
  opener: string;
};

// Four ways people arrive. Each one changes what Davit asks back and what
// lands in Telegram, so the first message is never "hi".
export const chatIntents: ChatIntent[] = [
  {
    id: "hiring",
    chip: "I'm hiring",
    said: "I'm hiring for a role.",
    reply: "Good. Which role, and what does the design team look like today? I'll tell you straight whether it's a fit.",
    placeholder: "Role, team size, where you're based…",
    opener: "Hi Davit — we're hiring and I think your experience fits."
  },
  {
    id: "project",
    chip: "I need design help",
    said: "I have a product that needs design help.",
    reply: "Tell me what the product is and where it's stuck — unclear direction, a system that won't scale, or something that needs shipping.",
    placeholder: "The product, and what's blocking it…",
    opener: "Hi Davit — I have a product that needs design help."
  },
  {
    id: "learn",
    chip: "I want to learn",
    said: "I want to learn design.",
    reply: "Are you starting from zero, or already working and looking to level up? The answer changes what I'd point you at.",
    placeholder: "Where you are now, and where you want to get…",
    opener: "Hi Davit — I want to learn design and I'm curious about your school."
  },
  {
    id: "collab",
    chip: "Let's collaborate",
    said: "I'd like to invite you or work together.",
    reply: "What's the event or the idea, and roughly when? I take on talks, juries and workshops when the room is right.",
    placeholder: "The event or idea, and timing…",
    opener: "Hi Davit — I'd like to invite you to speak or collaborate."
  }
];

/** Any CTA anywhere on the site can open the chat, optionally pre-picking an intent. */
export function openContactChat(intentId?: string) {
  window.dispatchEvent(new CustomEvent("dw:open-chat", { detail: intentId ?? null }));
}

export function ContactChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState<ChatIntent | null>(null);
  const [detail, setDetail] = useState("");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    const target = returnFocusRef.current;
    if (target && document.contains(target)) target.focus();
  }, []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const requested = (event as CustomEvent<string | null>).detail;
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setIntent(requested ? chatIntents.find((item) => item.id === requested) ?? null : null);
      setDetail("");
      setIsOpen(true);
    };
    window.addEventListener("dw:open-chat", onOpen);
    return () => window.removeEventListener("dw:open-chat", onOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Move focus into the panel on open, and to the composer once an intent is picked.
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      if (intent && textareaRef.current) textareaRef.current.focus();
      else panelRef.current?.querySelector<HTMLButtonElement>(".dw-chat-chip")?.focus();
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, intent]);

  const send = useCallback(() => {
    if (!intent) return;
    const body = detail.trim() ? `${intent.opener}\n\n${detail.trim()}` : intent.opener;
    window.open(`${DAVIT_TELEGRAM_URL}?text=${encodeURIComponent(body)}`, "_blank", "noopener");
    close();
  }, [intent, detail, close]);

  if (!isOpen) return null;

  return (
    <div className="dw-chat-layer">
      <button className="dw-chat-scrim" type="button" aria-label="Close conversation" onClick={close} />
      <div
        className="dw-chat-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Start a conversation with Davit"
        ref={panelRef}
      >
        <header className="dw-chat-head">
          <img className="dw-chat-avatar" src={CHAT_AVATAR} alt="" width={96} height={96} />
          <span className="dw-chat-who">
            <strong>Davit Pedanyan</strong>
            <small>Answers personally, usually same day</small>
          </span>
          <button
            className="dw-chat-close"
            type="button"
            onClick={close}
            aria-label="Close conversation"
            data-cursor-label="close the chat"
          >
            &times;
          </button>
        </header>

        <div className="dw-chat-thread" ref={scrollRef}>
          <p className="dw-chat-bubble is-davit">Hey — I&rsquo;m Davit. What brings you here?</p>
          {intent ? (
            <>
              <p className="dw-chat-bubble is-you">{intent.said}</p>
              <p className="dw-chat-bubble is-davit">{intent.reply}</p>
            </>
          ) : null}
        </div>

        {intent ? (
          <div className="dw-chat-composer">
            <textarea
              ref={textareaRef}
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) send();
              }}
              placeholder={intent.placeholder}
              rows={3}
              aria-label="Add detail to your message"
            />
            <div className="dw-chat-actions">
              <button
                className="dw-chat-back"
                type="button"
                onClick={() => { setIntent(null); setDetail(""); }}
                data-cursor-label="pick a different reason"
              >
                &larr; Back
              </button>
              <button
                className="dw-chat-send"
                type="button"
                onClick={send}
                data-cursor-label="continue on telegram"
              >
                Continue on Telegram &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="dw-chat-chips">
            {chatIntents.map((item) => (
              <button
                className="dw-chat-chip"
                type="button"
                key={item.id}
                onClick={() => setIntent(item)}
                data-cursor-label={item.chip.toLowerCase()}
              >
                {item.chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
