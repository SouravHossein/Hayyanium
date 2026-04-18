import ClientApp from "@/components/ClientApp";
import { allElementsData } from "@/data/elements";

export default function Home() {
  return <ClientApp initialElements={allElementsData} />;
}
