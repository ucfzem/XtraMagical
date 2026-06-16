import ProjectDetail from "./page-content";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function ProjectPage() {
  return <ProjectDetail />;
}
