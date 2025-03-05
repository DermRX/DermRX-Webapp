import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function TermsAndConditions() {
    const [content, setContent] = useState("Loading...");

    useEffect(() => {
        fetch("/markdown/tos.md")
            .then((response) => response.text())
            .then((text) => setContent(text))
            .catch(() => setContent("Failed to load privacy policy."));
    }, []);

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}
