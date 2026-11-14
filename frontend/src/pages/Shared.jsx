import { Link, useParams } from "react-router-dom";
import Program from "../components/Program.jsx";
import { Loading, ErrorBox } from "../components/common.jsx";
import { useFetch } from "../context.jsx";
import { PageHead } from "../components/deco.jsx";

export default function Shared() {
  const { code } = useParams();
  const { data, loading, error } = useFetch(`/programs/shared/${code}`);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const p = data.program;
  return (
    <>
      <PageHead tone="bleu" kicker={`Programme partagé par ${p.author}`} title={p.title} sub={`${p.governorate.name} · ${p.days} jour${p.days > 1 ? "s" : ""} · ${p.people} pers.`}>
        <Link className="btn" to={`/mix?gov=${p.governorate.slug}&budget=${p.budget}`}>Créer le mien avec FAZA MIX</Link>
      </PageHead>
      <div className="wrap section"><Program program={p} /></div>
    </>
  );
}
