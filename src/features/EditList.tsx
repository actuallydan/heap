import { useEffect, useState } from "react";
import { Plus, X, Copy } from "lucide-react";
import { ulid } from "ulidx";

import { api } from "~/utils/api";
import { type List, type Item } from "@prisma/client";

type EditListProps = {
  owner?: string;
  listData: List;
  items: Item[];
  id: string;
};

const EditList = ({ listData, owner = "", items, id }: EditListProps) => {
  const [title, setTitle] = useState(listData?.title || "");
  const [description, setDescription] = useState(listData?.description || "");
  const [listItems, setListItems] = useState<{ id: string; text: string }[]>(
    items.map((item) => ({ id: item.id, text: item.text }))
  );

  const [hasCopied, setHasCopied] = useState(false);

  const hasChanged = Boolean(
    listData?.title !== title ||
      listData?.description !== description ||
      items.length !== listItems.length ||
      items.some((item, index) => {
        const oldItem = listItems[index];

        if (oldItem) {
          return item.text !== oldItem.text;
        } else {
          return true;
        }
      })
  );

  const [shouldShowDescription, setShouldShowDescription] = useState(
    Boolean(listData?.description)
  );

  const utils = api.useContext();

  const updateListMutation = api.list.updateList.useMutation({
    onSuccess() {
      utils.list.getListsByUserId.invalidate().catch((error) => {
        console.error(error);
      });
    },
  });

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
    setListItems([...listItems, { id: ulid(), text: "" }]);
  }

  async function updateList() {
    if (!owner) {
      return;
    }

    // validate that the list has at least one item that is not empty
    if (
      listItems.length === 0 ||
      listItems.filter((item) => item.text !== "").length === 0
    ) {
      return;
    }

    try {
      const updatedList = {
        id: listData.id,
        title,
        description,
        items: listItems
          .filter((item) => item.text !== "")
          .map((item) => ({ id: item.id, text: item.text.trim() })),
        owner,
      };

      await updateListMutation.mutateAsync(updatedList);
    } catch (err) {
      console.error(err);
    }
  }

  function copyLink() {
    if (window) {
      const link = `${window.location.host}/${id}`;
      void navigator.clipboard.writeText(link);
      setHasCopied(true);

      setTimeout(() => {
        setHasCopied(false);
      }, 1500);
    }
  }

  return (
    <>
      <div className="mb-4 flex w-96 flex-row items-center justify-between rounded-lg border-2 border-purple-100 p-6 text-left">
        <p className="flex-grow-1 mb-1 mr-2 flex h-10 w-full items-center justify-start overflow-hidden rounded-lg border-2 border-purple-100 p-2 font-mono text-xs">
          {window ? `${window.location.host}/${id}` : ""}
        </p>
        <button
          className="mr-2 flex h-10 w-24 items-start justify-center rounded-lg border-2 p-2 text-sm text-gray-400"
          onClick={copyLink}
        >
          {hasCopied ? (
            <span className="text-black">copied!</span>
          ) : (
            <Copy color="#8b5cf6" size={20} />
          )}
        </button>
      </div>
      <div className="mt-6 w-96 rounded-lg border-2 border-purple-100 p-6 text-left">
        <h3 className="mb-4 text-2xl font-bold text-violet-500">
          edit your list
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
                  value={item.text}
                  className="mr-4 flex-grow rounded border border-purple-100 p-2"
                  placeholder={listItems.length === 1 ? "the matrix, obv" : ""}
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
                    const valueToUpdate = newListItems[index];

                    if (valueToUpdate) {
                      valueToUpdate.text = e.target.value;

                      newListItems[index] = valueToUpdate;
                      setListItems(newListItems);
                    }
                  }}
                />
                <button
                  className="p-2"
                  onClick={() => {
                    if (listItems.length === 1) {
                      // clear the value from this entry
                      setListItems([{ id: ulid(), text: "" }]);
                      return;
                    }

                    const newListItems = [...listItems];
                    newListItems.splice(index, 1);
                    setListItems(newListItems);
                  }}
                >
                  <X color="#8b5cf6" size={20} />
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
              owner && hasChanged ? "bg-violet-500" : "bg-violet-300"
            } p-2 text-white`}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={updateList}
          >
            update
          </button>
        </div>
      </div>
    </>
  );
};

export default EditList;
