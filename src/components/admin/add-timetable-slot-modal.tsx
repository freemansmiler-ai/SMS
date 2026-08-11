"use client";

import React, { useEffect, useState } from "react";
import {
  createTimetableSlot,
  WeekDay,
  DAYS_OF_WEEK,
  TIME_SLOTS,
} from "@/lib/services/timetable";
import { fetchClasses, ClassRecord } from "@/lib/services/classes";
import { fetchSubjects, SubjectRecord } from "@/lib/services/subjects";
import { fetchTeachers, TeacherRecord } from "@/lib/services/teachers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, ShieldAlert, AlertCircle, Plus } from "lucide-react";

interface AddTimetableSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddTimetableSlotModal: React.FC<AddTimetableSlotModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);

  const [classId, setClassId] = useState("class-basic8a");
  const [className, setClassName] = useState("Basic 8 - Section A");

  const [subjectId, setSubjectId] = useState("subj-math101");
  const [subjectName, setSubjectName] = useState("Core Mathematics");
  const [subjectCode, setSubjectCode] = useState("MATH-101");

  const [teacherId, setTeacherId] = useState("tch-201");
  const [teacherName, setTeacherName] = useState("Abena Appiah");

  const [day, setDay] = useState<WeekDay>("Monday");
  const [startTime, setStartTime] = useState("08:00 AM");
  const [endTime, setEndTime] = useState("09:00 AM");
  const [room, setRoom] = useState("Room B8-A");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    async function loadDropdownData() {
      try {
        const [cList, sList, tList] = await Promise.all([
          fetchClasses(),
          fetchSubjects(),
          fetchTeachers(),
        ]);

        if (cList && cList.length > 0) {
          setClasses(cList);
          setClassId(cList[0].id);
          setClassName(cList[0].name);
        }

        if (sList && sList.length > 0) {
          setSubjects(sList);
          setSubjectId(sList[0].id);
          setSubjectName(sList[0].name);
          setSubjectCode(sList[0].code);
        }

        if (tList && tList.length > 0) {
          setTeachers(tList);
          setTeacherId(tList[0].id);
          setTeacherName(`${tList[0].firstName} ${tList[0].lastName}`);
        }
      } catch (err) {
        console.error("Failed to load timetable options:", err);
      }
    }

    loadDropdownData();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await createTimetableSlot({
      classId,
      className,
      subjectId,
      subjectName,
      subjectCode,
      teacherId,
      teacherName,
      day,
      startTime,
      endTime,
      room,
    });

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Conflict detected: Slot allocation failed.");
      return;
    }

    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            Schedule Class Period Slot
          </DialogTitle>
          <DialogDescription className="text-xs">
            Assign class, subject, faculty teacher, day, time, and room location.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 py-1 text-xs">
          {/* Class Division */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Class Section:
            </label>
            <select
              value={classId}
              onChange={(e) => {
                const val = e.target.value;
                setClassId(val);
                const found = classes.find((c) => c.id === val);
                setClassName(found ? found.name : e.target.options[e.target.selectedIndex].text);
              }}
              className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 font-semibold text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              {classes.length > 0 ? (
                classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="class-basic8a">Basic 8 - Section A</option>
                  <option value="class-basic9b">Basic 9 - Section B</option>
                  <option value="class-basic7a">Basic 7 - Section A</option>
                  <option value="class-shs1sci">SHS 1 Science</option>
                </>
              )}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Subject:
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                const val = e.target.value;
                setSubjectId(val);
                const found = subjects.find((s) => s.id === val);
                if (found) {
                  setSubjectName(found.name);
                  setSubjectCode(found.code);
                } else if (val === "subj-math101") {
                  setSubjectName("Core Mathematics");
                  setSubjectCode("MATH-101");
                } else if (val === "subj-sci101") {
                  setSubjectName("Integrated Science");
                  setSubjectCode("SCI-101");
                } else {
                  setSubjectName("Core English Language");
                  setSubjectCode("ENG-101");
                }
              }}
              className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 font-semibold text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              {subjects.length > 0 ? (
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} ({s.name})
                  </option>
                ))
              ) : (
                <>
                  <option value="subj-math101">MATH-101 (Core Mathematics)</option>
                  <option value="subj-sci101">SCI-101 (Integrated Science)</option>
                  <option value="subj-eng101">ENG-101 (Core English Language)</option>
                </>
              )}
            </select>
          </div>

          {/* Faculty Teacher Selection */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Assigned Faculty Teacher:
            </label>
            <select
              value={teacherId}
              onChange={(e) => {
                const val = e.target.value;
                setTeacherId(val);
                const found = teachers.find((t) => t.id === val);
                setTeacherName(
                  found
                    ? `${found.firstName} ${found.lastName}`
                    : e.target.options[e.target.selectedIndex].text
                );
              }}
              className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 font-semibold text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              {teachers.length > 0 ? (
                teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.employeeCode})
                  </option>
                ))
              ) : (
                <>
                  <option value="tch-201">Abena Appiah</option>
                  <option value="tch-202">Kofi Acheampong</option>
                  <option value="tch-203">Ama Osei</option>
                  <option value="tch-204">Yaw Boateng</option>
                </>
              )}
            </select>
          </div>

          {/* Day & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Day of Week:
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as WeekDay)}
                className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 font-semibold text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Start Time:
              </label>
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  const found = TIME_SLOTS.find((t) => t.start === e.target.value);
                  if (found) setEndTime(found.end);
                }}
                className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 font-semibold text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                {TIME_SLOTS.map((t, idx) => (
                  <option key={idx} value={t.start}>
                    {t.start} - {t.end}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room Location */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Classroom / Room Location:
            </label>
            <Input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room B8-A or Science Lab 1"
              className="h-8 text-xs font-semibold"
            />
          </div>

          <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Automated Conflict Safeguard: Prevents teacher double-booking and room overlap.</span>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{loading ? "Scheduling..." : "Schedule Period"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
