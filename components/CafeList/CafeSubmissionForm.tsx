import { useMapContext } from "@/lib/MapContext";

export default function CafeSubmissionForm() {
  const { setOverlayView } = useMapContext();

  return (
    <div className="p-4 flex flex-col w-full h-full">
      <h2 className="text-lg font-bold">Cafe Submission Form</h2>
      <button
        onClick={() => setOverlayView("cafeList")}
        className="bg-[#eaeaea] w-20 self-end rounded-sm font-bold hover:bg-[#676767] cursor-pointer"
      >
        return
      </button>
      <p className="text-sm mt-2 p-2 pb-0">
        Thanks for helping us improve our database! It's people like you that
        make it possible to bring the best cafes to coffee lovers everywhere.
      </p>
      <p className="text-sm italic p-2 pt-0">
        This form is very analog because of all the legality involved with
        building a database. We're figuring out a better way to do this.
      </p>
      <div>
        <form className="[&>input]:mb-3 flex flex-col">
          <label className="text-sm">Cafe Name</label>
          <input
            type="text"
            placeholder="Cafe Name"
            className="border-accent border w-full p-1 text-[0.9rem] rounded-md"
          />
          <label className="text-sm">Address</label>
          <input
            type="text"
            placeholder="Address"
            className="border-accent border w-full p-1 text-[0.9rem] rounded-md"
          />
          <label className="text-sm">Website</label>
          <input
            type="text"
            placeholder="Website"
            className="border-accent border w-full p-1 text-[0.9rem] rounded-md"
          />
          <label className="text-sm">Vibe</label>
          <input
            type="text"
            placeholder="Vibe"
            className="border-accent border w-full p-1 text-[0.9rem] rounded-md"
          />
          <label className="text-sm">Why you love it</label>
          <textarea
            className="border-accent border h-40 overflow-auto resize-none rounded-md p-2 text-[0.9rem]"
            placeholder="Tell us more..."
          />
        </form>
      </div>
    </div>
  );
}
