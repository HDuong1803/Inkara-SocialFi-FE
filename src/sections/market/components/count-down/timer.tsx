import { Countdown } from "./count-down";


const ShowCounter = ({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) => {
  return (
    <div className="flex items-center gap-1.5 px-10 py-1.5 bg-neutral2-3 rounded-[20px] transition-colors duration-200 shadow-card p-2">
      <span className="font-semibold text-gray-100">
        {days.toString().padStart(2, '0')}
      </span>
      <span className="font-medium text-gray-400">:</span>
      <span className="font-semibold text-gray-100">
        {hours.toString().padStart(2, '0')}
      </span>
      <span className="font-medium text-gray-400">:</span>
      <span className="font-semibold text-gray-100">
        {minutes.toString().padStart(2, '0')}
      </span>
      <span className="font-medium text-gray-400">:</span>
      <span className="font-semibold text-gray-100">
        {seconds.toString().padStart(2, '0')}
      </span>
      <span className="font-medium text-gray-400">left</span>
    </div>
  );
};

const CountdownTimer = ({ targetDate }: { targetDate: number }) => {
  const [days, hours, minutes, seconds] = Countdown(targetDate);
  return (
    <ShowCounter
      days={days}
      hours={hours}
      minutes={minutes}
      seconds={seconds}
    />
  );
};

export default CountdownTimer;