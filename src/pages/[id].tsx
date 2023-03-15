import { type GetServerSidePropsContext } from "next/types";
import { api } from "~/utils/api";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import ViewList from "~/features/ViewList";
import EditList from "~/features/EditList";

export default function ListPage({ id = "" }: ListPageProps) {
  const { data: fingerprint } = useVisitorData();

  const { data, isLoading, error } = api.list.getListById.useQuery(
    { id },
    { enabled: Boolean(id) }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Not found</div>;
  }

  return (
    <main className="mb-8 mt-8 flex w-full flex-1 flex-col items-center justify-start px-20 text-center">
      <h1 className="my-4 inline-block bg-gradient-to-r from-violet-600 via-purple-500 to-red-400 bg-clip-text text-7xl font-bold text-transparent">
        heap
      </h1>
      {fingerprint?.visitorId === data.owner ? (
        <EditList
          owner={fingerprint?.visitorId}
          listData={data}
          items={data.items}
          id={id}
        />
      ) : (
        <ViewList listData={data} items={data.items} />
      )}
    </main>
  );
}

type ListPageProps = {
  id: string | undefined;
};

export function getServerSideProps(context: GetServerSidePropsContext) {
  if (!context?.params?.id) {
    return {
      notFound: true,
    };
  }

  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
}
