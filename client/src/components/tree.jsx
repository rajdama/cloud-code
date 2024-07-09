const FileTreeNode = ({ fileName, nodes }) => {
  return (
    <div style={{ marginLeft: "10px" }}>
      {fileName}
      {nodes && (
        <ul>
          {Object.keys(nodes).map((child, index) => {
            return (
              <li key={index}>
                <FileTreeNode fileName={child} nodes={nodes[child]} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const FileTree = ({ tree }) => {
  return <FileTreeNode fileName="/" nodes={tree} />;
};
export default FileTree;
