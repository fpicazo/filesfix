import React, { useState } from "react";
import { Edit2 } from "lucide-react";
import { formatDateToDMY } from "../../utils/formatDate";
import ManagementIcon from "../../assets/helperIcons/ManagementIcon";
import EditIcon from "../../assets/helperIcons/EditIcon";
import EventIcon from "../../assets/helperIcons/EventIcon";
import InternalCostingIcon from "../../assets/helperIcons/InternalCostingIcon";
import BookingDateIcon from "../../assets/helperIcons/BookingDateIcon";
import ShareIcon from "../../assets/helperIcons/ShareIcon";
import ClockIcon from "../../assets/helperIcons/ClockIcon";
import { formatDateTime } from '../../utils/formatDate';


export default function EventRecap({ event, onUpdate }) {
  const [editingRecap, setEditingRecap] = useState(false);
  const [recapDraft, setRecapDraft] = useState({
    status: event.status || "",
    amount: event.amount || "",
    pagado: event.pagado || "",
    balance: event.balance || "",
    cost: event.cost || "",
    guests: event.guests || "",
    date: event.date || "",
  });

  const statusOptions = [
    "Pendiente",
    "Mandar cotización",
    "Vendido",
    "Planeado",
    "Pago retrasado",
    "Vencido",
    "Cancelado",
  ];

  const handleSaveRecap = () => {
    onUpdate("recap", recapDraft);
    setEditingRecap(false);
  };

  const handleCancelRecap = () => {
    setEditingRecap(false);
    setRecapDraft({
      status: event.status || "",
      amount: event.amount || "",
      pagado: event.pagado || "",
      balance: event.balance || "",
      cost: event.cost || "",
      guests: event.guests || "",
      date: event.date || "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <ManagementIcon />
          <h2 className="text-lg font-medium text-[#030712]">Event Recap</h2>
        </div>
        {editingRecap ? (
          <div className="flex gap-2">
            <button
              onClick={handleSaveRecap}
              className="bg-purple-600 text-white text-sm px-3 py-1 rounded-md"
            >
              Save
            </button>
            <button
              onClick={handleCancelRecap}
              className="text-sm text-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingRecap(true)}
            className="text-purple-600 hover:text-purple-800"
          >
            <EditIcon />
          </button>
        )}
      </div>

      {/* first row */}
      <div className={`${editingRecap ? 'grid grid-cols-3 gap-4' : 'flex gap-2'}`}>
        <div
          className={`${editingRecap ? '' : 'flex justify-between gap-2 flex-wrap flex-1'} pt-3 pb-8 relative ${
            editingRecap
              ? ""
              : "before:absolute before:bottom-0 before:h-[8px] before:w-full before:bg-[#27BE69] before:rounded-sm"
          }`}
        >
          <div className="w-full">
            <label className="font-normal text-[#595959] text-sm block mb-1">
              {editingRecap ? null : (
                <div className="h-[12px] w-[12px] bg-[#E6E6E6] inline-block mr-2"></div>
              )}
              Total Amount
            </label>
            {editingRecap ? (
              <input
                type="text"
                value={recapDraft.amount}
                onChange={(e) =>
                  setRecapDraft({ ...recapDraft, amount: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            ) : (
              <div>
                <p className="text-[#000000] text-xl py-1">
                  {event.amount} <span className="text-[#AEADAF]">USD</span>
                </p>
                <p className="text-xs text-[#8E8C8F]">Invoice #48902</p>
              </div>
            )}
          </div>

          {!editingRecap && (
            <div className="text-end">
              <label className="font-normal text-[#595959] text-sm">
                <div className="h-[12px] w-[12px] bg-[#27BE69] inline-block mr-2"></div>
                Pagado
              </label>
              <div>
                <p className="text-[#000000] text-xl py-1">
                  {event.pagado} <span className="text-[#AEADAF]">USD</span>
                </p>
                <p className="text-xs text-[#8E8C8F]">67.09%</p>
              </div>
            </div>
          )}
        </div>

        {editingRecap && (
          <div className="pt-3 pb-8">
            <label className="font-normal text-[#595959] text-sm block mb-1">
              Pagado
            </label>
            <input
              type="text"
              value={recapDraft.pagado}
              onChange={(e) =>
                setRecapDraft({ ...recapDraft, pagado: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        )}

        <div
          className={`pt-3 pb-8 relative ${
            editingRecap
              ? ""
              : "before:absolute before:bottom-0 before:h-[8px] before:w-full before:bg-[#FAAD14] before:rounded-sm "
          }`}
        >
          <div className={`${editingRecap ? '' : 'pl-12 text-end'} w-full`}>
            <label className="font-normal text-[#595959] text-sm block mb-1">
              {editingRecap ? null : (
                <div className="h-[12px] w-[12px] bg-[#FAAD14] inline-block mr-2"></div>
              )}
              Balance / Due
            </label>

            {editingRecap ? (
              <input
                type="text"
                value={recapDraft.balance}
                onChange={(e) =>
                  setRecapDraft({ ...recapDraft, balance: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            ) : (
              <div>
                <p className="text-[#000000] text-xl py-1">
                  {event.balance} <span className="text-[#AEADAF]">USD</span>
                </p>
                <p className="text-xs text-[#8E8C8F]">67.09%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* second row */}
      <div className={`mt-6 ${editingRecap ? 'grid grid-cols-3 gap-4' : 'flex divide-x divide-[#B7B8BD33]'} bg-[#DED9E333] rounded-md py-4 text-sm [&_label]:font-normal [&_label]:text-xs [&_label]:text-[#8E8C8F] [&_p]:text-[#18181B] [&_p]:font-medium [&_p]:mt-1 [&_p]:text-base`}>
        {/* Total Guest */}
        <div className={`${editingRecap ? '' : 'flex-1 pl-4'} flex gap-2 items-center`}>
          <div className="w-[34px] h-[34px] rounded-full border border-[#E6E6E6] flex items-center justify-center flex-shrink-0">
            <EventIcon />
          </div>
          <div className="flex-1 min-w-0">
            <label>Total Guest</label>
            {editingRecap ? (
              <input
                type="number"
                value={recapDraft.guests}
                onChange={(e) =>
                  setRecapDraft({ ...recapDraft, guests: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <p>{event.guests}</p>
            )}
          </div>
        </div>

        {/* Booking Date */}
        <div className={`${editingRecap ? '' : 'flex-1 pl-12'} flex gap-2 items-center`}>
          <div className="w-[34px] h-[34px] rounded-full border border-[#E6E6E6] flex items-center justify-center flex-shrink-0">
            <BookingDateIcon />
          </div>
          <div className="flex-1 min-w-0">
            <label>Booking Date</label>
            {editingRecap ? (
              <input
                type="date"
                value={recapDraft.date}
                onChange={(e) =>
                  setRecapDraft({ ...recapDraft, date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <p>{formatDateToDMY(event.date)}</p>
            )}
          </div>
        </div>

        {/* Internal Costing */}
        <div className={`${editingRecap ? '' : 'flex-1 pl-12'} flex gap-2 items-center`}>
          <div className="w-[34px] h-[34px] rounded-full border border-[#E6E6E6] flex items-center justify-center flex-shrink-0">
            <InternalCostingIcon />
          </div>
          <div className="flex-1 min-w-0">
            <label>Internal Costing</label>
            {editingRecap ? (
              <input
                type="text"
                value={recapDraft.cost}
                onChange={(e) =>
                  setRecapDraft({ ...recapDraft, cost: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <p>{event.cost}</p>
            )}
          </div>
        </div>

        {/* <div className="">
          <label>Status</label>
          {editingRecap ? (
            <select
              value={recapDraft.status}
              onChange={(e) =>
                setRecapDraft({ ...recapDraft, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <p>{event.status}</p>
          )}
        </div> */}
      </div>
      <div className="flex justify-between gap-2 flex-wrap mt-4">
        <p className="text-sm text-[#8E8C8F] flex gap-2 items-center">
          <ClockIcon/> <span>Last Updated {formatDateTime(event.updatedAt)} </span>
        </p>
        <a href={`/invoices?eventid=${event._id}`} target="_blank" className="text-sm text-[#240046] flex gap-2 items-center">
          View Invoice & Billing <ShareIcon color="#240046" />
        </a>
      </div>
    </div>
  );
}
