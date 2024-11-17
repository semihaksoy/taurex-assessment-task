import { useEffect, useState, useCallback, useMemo } from "react";
import "./App.css";
import EmployeeTree from "./components/EmployeeTree";
import type { Employee } from "./types";
import { fetchEmployees } from "./apis/employees.api";

type TreeMapRef = {
  [id: number]: {
    childrenLength: number;
    selectedChildren: Set<number>;
    managerId: number | null;
  };
};

function App() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [employeeTree, setEmployeeTree] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const hierarchyMap = useMemo(() => ({} as TreeMapRef), []);

  useEffect(() => {
    const fetchAndBuildTree = async () => {
      try {
        const employees = await fetchEmployees();
        const tree = buildTree(employees);
        setEmployeeTree(tree);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndBuildTree();
  }, []);

  const buildTree = (data: Employee[]): Employee[] => {
    const map: Record<number, Employee> = {};
    const roots: Employee[] = [];

    data.forEach((item) => {
      map[item.Id] = { ...item, children: [] };
      hierarchyMap[item.Id] = {
        childrenLength: 0,
        selectedChildren: new Set(),
        managerId: item.ManagerId ?? null,
      };
    });

    data.forEach((item) => {
      if (item.ManagerId) {
        map[item.ManagerId].children!.push(map[item.Id]);
        hierarchyMap[item.ManagerId].childrenLength++;
      } else {
        roots.push(map[item.Id]);
      }
    });

    return roots;
  };

  const toggleSelect = useCallback(
    (checked: boolean, node: Employee) => {
      const updatedSelection = new Set(selectedIds);

      const updateParentSelection = (nodeId: number, managerId: number | null) => {
        if (!managerId) return;
        const parent = hierarchyMap[managerId];
        parent.selectedChildren.add(nodeId);

        if (parent.childrenLength === parent.selectedChildren.size) {
          updatedSelection.add(managerId);
          updateParentSelection(managerId, parent.managerId);
        }
      };

      const updateParentDeselection = (nodeId: number, managerId: number | null) => {
        if (!managerId) return;
        const parent = hierarchyMap[managerId];
        parent.selectedChildren.delete(nodeId);

        if (parent.selectedChildren.size === 0) {
          updatedSelection.delete(managerId);
          updateParentDeselection(managerId, parent.managerId);
        }
      };

      const selectWithChildren = (node: Employee) => {
        updatedSelection.add(node.Id);
        updateParentSelection(node.Id, node.ManagerId);
        node.children?.forEach(selectWithChildren);
      };

      const deselectWithChildren = (node: Employee) => {
        updatedSelection.delete(node.Id);
        updateParentDeselection(node.Id, node.ManagerId);
        node.children?.forEach(deselectWithChildren);
      };

      if (checked) {
        selectWithChildren(node);
      } else {
        deselectWithChildren(node);
      }

      setSelectedIds(updatedSelection);
    },
    [selectedIds, hierarchyMap]
  );

  const sendSelectedIdsToServer = useCallback(() => {
    const idsArray = Array.from(selectedIds);
    console.log("Sending selected IDs to server:", idsArray);
    setTimeout(() => {
      alert(`Mock server received selected IDs: ${idsArray.join(", ")}`);
    }, 500);
  }, [selectedIds]);

  return (
    <div className="app-container">
      <h1 className="app-header">Employee Hierarchy</h1>
      {loading ? (
        <div className="loading-message">Loading...</div>
      ) : (
        <div className="content-wrapper">
          <EmployeeTree
            nodes={employeeTree}
            selectedIds={selectedIds}
            toggleSelect={toggleSelect}
          />
          <div className="sticky-button-container">
            <button
              onClick={sendSelectedIdsToServer}
              disabled={selectedIds.size === 0}
              className="send-button"
            >
              Send Selected IDs to Server
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
}

export default App;
