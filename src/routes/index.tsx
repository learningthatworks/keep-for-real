import { createFileRoute } from "@tanstack/react-router";
import { KeepApp } from "@/components/keep-app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <KeepApp />;
}
