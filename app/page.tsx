import ClientApp from "@/components/ClientApp";
import { allElementsData } from "@/data/elements";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <ClientApp initialElements={allElementsData} />
    </Suspense>
  );
}
