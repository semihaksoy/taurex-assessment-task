import { memo } from "react";
import type { Employee } from "../types";

type EmployeeTreeProps = {
  nodes: Employee[];
  selectedIds: Set<number>;
  toggleSelect: (checked: boolean, node: Employee) => void;
};

const EmployeeTree: React.FC<EmployeeTreeProps> = ({ nodes, selectedIds, toggleSelect }) => {
  const renderNodes = (nodes: Employee[]): JSX.Element[] => {
    return nodes.map((node) => (
      <li key={node.Id}>
        <label>
          <input
            type="checkbox"
            checked={selectedIds.has(node.Id)}
            onChange={(e) => toggleSelect(e.target.checked, node)}
          />
          {node.Name} - {node.Title}
        </label>
        {node.children && node.children.length > 0 && <ul>{renderNodes(node.children)}</ul>}
      </li>
    ));
  };

  return <ul>{renderNodes(nodes)}</ul>;
};

export default memo(EmployeeTree);
