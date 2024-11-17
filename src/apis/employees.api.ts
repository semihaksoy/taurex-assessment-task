import { MOCK_EMPLOYEES } from "../utils/constants";
import { Employee } from "../types";

export const fetchEmployees = async (): Promise<Employee[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_EMPLOYEES);
    }, 2000);
  });
};