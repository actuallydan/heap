import { useEffect, useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { Plus, X } from "lucide-react";

import { api } from "~/utils/api";
import { type List } from "@prisma/client";
import { useRouter } from "next/navigation";

const Home: NextPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listItems, setListItems] = useState<string[]>([""]);

  const [shouldShowDescription, setShouldShowDescription] = useState(false);

  const router = useRouter();

  const { data } = useVisitorData();

  const createListMutation = api.list.createList.useMutation();

  useEffect(() => {
    if (listItems.length > 1) {
      // get the ref to the last input and focus it
      const lastInput = document.getElementById(
        `list-item-${listItems.length - 1}`
      );
      if (lastInput) {
        lastInput.focus();
      }
    }
  }, [listItems.length]);

  function focusNextItem(index: number) {
    const nextInput = document.getElementById(`list-item-${index + 1}`);
    if (nextInput) {
      nextInput.focus();
    }
  }

  function addListItem() {
    setListItems([...listItems, ""]);
  }

  async function createList() {
    if (!data?.visitorId) {
      return;
    }

    // validate that the list has at least one item that is not empty
    if (listItems.length === 0 || listItems[0] === "") {
      return;
    }

    try {
      const newList = {
        title,
        description,
        items: listItems
          .filter((item) => item !== "")
          .map((item) => item.trim()),
        owner: data.visitorId,
      };

      const res: List = await createListMutation.mutateAsync(newList);

      // redirect to the new list
      router.push(`/${res.id}`);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <Head>
        <title>heap</title>
        <meta name="description" content="make lists of stuff" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mb-8 mt-8 flex w-full flex-1 flex-col items-center justify-start px-20 text-center">
        <h1 className="my-4 inline-block bg-gradient-to-r from-violet-600 via-purple-500 to-red-400 bg-clip-text text-7xl font-bold text-transparent">
          heap
        </h1>
        <p className="mt-3 text-2xl">
          make lists <span className="text-xs">and share them I guess?</span>
        </p>
        <div className="mt-6 w-96 rounded-lg border-2 border-purple-100 p-6 text-left">
          <h3 className="mb-4 text-2xl font-bold text-violet-500">
            create a new list
          </h3>
          <div className="mb-8">
            <p className="mb-1">
              <label className="font-bold" htmlFor="title">
                title
              </label>
            </p>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              className="mb-1 w-full rounded border border-purple-100 p-2"
              placeholder="top 10 movies of 10000 B.C.E."
            />
            <p className="text-sm text-gray-400">optional</p>
          </div>

          {shouldShowDescription ? (
            <div className="mb-8">
              <p className="mb-1">
                <label className="font-bold" htmlFor="description">
                  description
                </label>
              </p>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                className="mb-1 w-full rounded border border-purple-100 p-2"
                placeholder="ranked by cave paintings"
              />
              <p className="text-sm text-gray-400">also optional</p>
            </div>
          ) : (
            <button
              className="mb-8 flex flex-row items-center"
              onClick={() => {
                setShouldShowDescription(true);
              }}
            >
              <Plus color="#8b5cf6" size={15} fontWeight="bold" />
              <span className="ml-1 text-sm text-violet-500">
                add description
              </span>
            </button>
          )}

          <div>
            {listItems.map((item, index) => {
              return (
                <div
                  key={index}
                  className="mb-2 flex flex-row items-center justify-between"
                >
                  <input
                    autoFocus
                    id={`list-item-${index}`}
                    type="text"
                    value={item}
                    className="mr-4 flex-grow rounded border border-purple-100 p-2"
                    placeholder={
                      listItems.length === 1 ? "the matrix, obv" : ""
                    }
                    onKeyDown={(e) => {
                      // only add a new item if the user is on the last item, otherwise focus the next item
                      if (e.key === "Enter") {
                        index === listItems.length - 1
                          ? addListItem()
                          : focusNextItem(index);
                      }
                    }}
                    onChange={(e) => {
                      const newListItems = [...listItems];
                      newListItems[index] = e.target.value;
                      setListItems(newListItems);
                    }}
                  />
                  <button
                    className="p-2"
                    onClick={() => {
                      if (listItems.length === 1) {
                        // clear the value from this entry
                        setListItems([""]);
                        return;
                      }

                      const newListItems = [...listItems];
                      newListItems.splice(index, 1);
                      setListItems(newListItems);
                    }}
                  >
                    <X color="#8b5cf6" size={20} fontWeight="bold" />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            className="mb-8 flex flex-row items-center"
            onClick={addListItem}
          >
            <Plus color="#8b5cf6" size={15} fontWeight="bold" />
            <span className="ml-1 text-sm text-violet-500">add item</span>
          </button>
          <div>
            <button
              className={`mt-3 w-full rounded ${
                data?.visitorId ? "bg-violet-500" : "bg-violet-300"
              } p-2 text-white`}
              onClick={createList}
            >
              create
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
