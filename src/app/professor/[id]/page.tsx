import ProfessorProfile from "./ProfessorProfile";

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: "demo-professor" }, { id: "HEMIS-TC-1102" }];
}

export default function Page() {
  return <ProfessorProfile />;
}