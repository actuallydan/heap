import Head from "next/head";

import { type List, type Item } from "@prisma/client";

type ViewListProps = {
  listData: List;
  items: Item[];
};

const EditList = ({ listData, items }: ViewListProps) => {
  return (
    <>
      <div className="mt-6 w-96 rounded-lg border-2 border-purple-100 p-6 text-left">
        <h3 className="mb-4 text-2xl font-bold text-violet-500">
          {listData.title}
        </h3>

        <p className="mb-8">{listData.description}</p>

        <ul>
          {items.map((item) => {
            return (
              <li
                key={item.id}
                className="mb-2 mr-4 flex-grow rounded border border-purple-100 p-2"
              >
                {item.text}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default EditList;
