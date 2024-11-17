export type Employee = {
    Id: number;
    Name: string;
    Title: string;
    ManagerId: number | null;
    children?: Employee[];
};
  