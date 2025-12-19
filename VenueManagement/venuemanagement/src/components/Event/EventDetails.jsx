import React, { useEffect, useState } from "react";
import { Edit2 } from "lucide-react";
import CalenderIcon from "../../assets/helperIcons/CalendarIcon";
import CalenderBigIcon from "../../assets/helperIcons/CalenderBigIcon";
import EditIcon from "../../assets/helperIcons/EditIcon";
import ClockIcon from "../../assets/helperIcons/ClockIcon";
import UserIcon from "../../assets/helperIcons/UserIcon";

export default function EventDetails({
  event,
  customerOptions = [],
  onUpdate,
  settings,
}) {
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState({
    customer: event.customerId?.name || event.customer || "",
    time: event.time || "",
    eventType: event.eventType || "",
    sillasType: event.sillasType || "",
    mantelType: event.mantelType || "",
    location: event.location || "",
    foodType: event.foodType || "",
    customFields: event.customFields || {},
  });

  const eventTypeOptions = ["Bautizo", "Boda", "Fiesta", "Bithday"];
  const placeOptions = ["Jardín", "Salón"];
  const customFields = settings?.customFields || [];
  const timeOptions = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`
  );

  const handleSaveDetails = () => {
    onUpdate("details", detailsDraft);
    setEditingDetails(false);
  };

  const handleCustomFieldChange = (fieldId, value) => {
    setDetailsDraft(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: value
      }
    }));
  };

  const handleCancelDetails = () => {
    setEditingDetails(false);
    setDetailsDraft({
      customer: event.customerId?.name || event.name || "",
      time: event.time || "",
      eventType: event.eventType || "",
      sillasType: event.sillasType || "",
      mantelType: event.mantelType || "",
      location: event.location || "",
      foodType: event.foodType || "",
      customFields: event.customFields || {},
    });
  };

  useEffect(() => {
    console.log("Custom Fields from settings:", settings);
  }, [settings]); 

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        
        <div className="flex gap-2 items-center">
          <CalenderBigIcon />
          <h2 className="text-lg font-medium text-[#030712]">Event Details</h2>
        </div>

        {editingDetails ? (
          <div className="flex gap-2">
            <button
              onClick={handleSaveDetails}
              className="bg-purple-600 text-white text-sm px-3 py-1 rounded-md"
            >
              Save
            </button>
            <button
              onClick={handleCancelDetails}
              className="text-sm text-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setEditingDetails(true)}>
            <EditIcon />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 text-sm [&_label]:font-normal [&_label]:text-xs [&_label]:text-[#8E8C8F] [&_p]:text-[#18181B] [&_p]:font-medium [&_p]:mt-1 [&_p]:text-sm [&_p]:flex [&_p]:gap-2 [&_p]:items-center divide-y divide-[#E6E6E6]">
        <div className="py-3 pr-4 border-t border-[#E6E6E6]">
          <label>Event Time</label>
          {editingDetails ? (
            <select
              value={detailsDraft.time}
              onChange={(e) =>
                setDetailsDraft({ ...detailsDraft, time: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          ) : (
            <p>
              {" "}
              <ClockIcon /> {event.time}
            </p>
          )}
        </div>

        <div className="py-3">
          <div className="pl-4 border-l border-[#B7B8BD33] h-full">
            <label>Customer Name</label>
            {editingDetails ? (
              <select
                value={detailsDraft.customer}
                onChange={(e) =>
                  setDetailsDraft({
                    ...detailsDraft,
                    customer: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              >
                <option value="">Select Customer</option>
                {customerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            ) : (
              <p> <UserIcon/> {event.customerId?.name || ""}</p>
            )}
          </div>
        </div>

        <div className="py-3 pr-4">
          <label>Event Type</label>
          {editingDetails ? (
            <select
              value={detailsDraft.eventType}
              onChange={(e) =>
                setDetailsDraft({
                  ...detailsDraft,
                  eventType: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
            >
              {eventTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-600">{event.eventType}</p>
          )}
        </div>
        <div className="py-3">
          <div className="pl-4 border-l border-[#B7B8BD33] h-full">
            <label className="font-medium text-gray-800">Chair Type</label>
            {editingDetails ? (
              <input
                type="text"
                value={detailsDraft.sillasType}
                onChange={(e) =>
                  setDetailsDraft({
                    ...detailsDraft,
                    sillasType: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <p className="text-gray-600">{event.sillasType}</p>
            )}
          </div>
        </div>

        <div className="py-3 pr-4">
          <label className="font-medium text-gray-800">Sheets Type</label>
          {editingDetails ? (
            <input
              type="text"
              value={detailsDraft.mantelType}
              onChange={(e) =>
                setDetailsDraft({
                  ...detailsDraft,
                  mantelType: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
            />
          ) : (
            <p className="text-gray-600">{event.mantelType}</p>
          )}
        </div>

        <div className="py-3">
          <div className="pl-4 border-l border-[#B7B8BD33] h-full">
            <label className="font-medium text-gray-800">Theme</label>
            <p className="text-gray-600">White & Yellow</p>
          </div>
        </div>

        <div className="py-3 pr-4">
          <label className="font-medium text-gray-800">Type of Food</label>
          {editingDetails ? (
            <input
              type="text"
              value={detailsDraft.foodType}
              onChange={(e) =>
                setDetailsDraft({
                  ...detailsDraft,
                  foodType: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
            />
          ) : (
            <p className="text-gray-600">{event.foodType}</p>
          )}
        </div>

        <div className="py-3">
          <div className="pl-4 border-l border-[#B7B8BD33] h-full">
            <label className="font-medium text-gray-800">Lugar</label>
            {editingDetails ? (
              <select
                value={detailsDraft.location}
                onChange={(e) =>
                  setDetailsDraft({ ...detailsDraft, location: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              >
                {placeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-600">{event.location}</p>
            )}
          </div>
        </div>

        {/* Custom Fields */}
        {customFields.map((field, index) => {
          const isOdd = index % 2 === 1;
          const fieldValue = detailsDraft.customFields[field._id] || event.customFields?.[field._id] || '';
          
          const fieldContent = (
            <>
              <label className="font-medium text-gray-800">{field.name}</label>
              {editingDetails ? (
                field.fieldType === 'text' ? (
                  <input
                    type="text"
                    value={fieldValue}
                    onChange={(e) => handleCustomFieldChange(field._id, e.target.value)}
                    placeholder={field.placeholder || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  />
                ) : field.fieldType === 'dropdown' ? (
                  <select
                    value={fieldValue}
                    onChange={(e) => handleCustomFieldChange(field._id, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  >
                    <option value="">Select...</option>
                    {field.choices?.map((choice, idx) => (
                      <option key={idx} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                ) : field.fieldType === 'checkbox' ? (
                  <div className="mt-1 space-y-2">
                    {field.choices?.map((choice, idx) => {
                      const selectedChoices = Array.isArray(fieldValue) ? fieldValue : [];
                      return (
                        <label key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedChoices.includes(choice)}
                            onChange={(e) => {
                              const newChoices = e.target.checked
                                ? [...selectedChoices, choice]
                                : selectedChoices.filter(c => c !== choice);
                              handleCustomFieldChange(field._id, newChoices);
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{choice}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : null
              ) : (
                <p className="text-gray-600">
                  {field.fieldType === 'checkbox' && Array.isArray(fieldValue)
                    ? fieldValue.join(', ') || '-'
                    : fieldValue || '-'}
                </p>
              )}
            </>
          );
          
          return (
            <div key={field._id} className="py-3 pr-4">
              {isOdd ? (
                <div className="pl-4 border-l border-[#B7B8BD33] h-full">
                  {fieldContent}
                </div>
              ) : (
                fieldContent
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
