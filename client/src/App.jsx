import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Terminal from "./components/terminal";
import "@xterm/xterm/css/xterm.css";
import FileTree from "./components/tree";
import socket from "./socket";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

function App() {
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [code, setCode] = useState("");

  let isSaved = selectedFileContent === code;

  const getFileTree = async () => {
    const response = await fetch("http://localhost:9000/files");
    const result = await response.json();
    setFileTree(result.tree);
  };

  const getFileContents = useCallback(async () => {
    if (!selectedFile) return;
    const response = await fetch(
      `http://localhost:9000/files/content?path=${selectedFile}`
    );
    const result = await response.json();
    setSelectedFileContent(result.content);
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile && selectedFileContent) {
      setCode(selectedFileContent);
    }
  }, [selectedFile, selectedFileContent]);

  useEffect(() => {
    getFileTree();
  }, []);

  useEffect(() => {
    getFileTree();
  }, []);

  useEffect(() => {
    if (selectedFile) getFileContents();
  }, [getFileContents, selectedFile]);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, []);

  useEffect(() => {
    setCode("");
  }, [selectedFile]);

  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: selectedFile,
          content: code,
        });
      }, 5 * 1000);

      isSaved = true;

      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFile, isSaved]);

  return (
    <div>
      <div className="playground-container">
        <div className="editor-container">
          <div className="files">
            <FileTree
              onSelect={(path) => {
                setSelectedFile(path);
              }}
              tree={fileTree}
            />
          </div>
          <div className="editor">
            {selectedFile && (
              <p>
                {selectedFile.replaceAll("/", " > ")}{" "}
                {isSaved ? "Saved" : "Unsaved"}
              </p>
            )}
            <AceEditor
              theme="ace-cobalt"
              value={code}
              onChange={(e) => setCode(e)}
            />
          </div>
        </div>
        <Terminal />
      </div>
    </div>
  );
}

export default App;
