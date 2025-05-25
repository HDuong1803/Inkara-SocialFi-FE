import { Avatar } from '@/components/avatar';
import { Typography } from '@/components/typography';
import { IMessage } from '@/interfaces/message';
import { USER_AVATAR_PLACEHOLDER } from '@/constant';

//----------------------------------------------------------------------

interface IMessageItemProps {
  message: IMessage;
}

export default function MessageItem({ message }: IMessageItemProps) {
  return (
    <div className="w-full flex items-start justify-start gap-4 rounded-[1.25rem] p-3 bg-neutral2-2">
      <Avatar
        src={message.author?.photo?.url || USER_AVATAR_PLACEHOLDER}
        alt="avatar-user"
      />

      <div className="grow flex flex-col gap-2">
        <div className="flex items-center">
          <Typography
            level="base2m"
            className="text-primary opacity-80 flex items-center gap-2"
          >
            {message?.author?.fullname || 'Anonymous User'}
            <Typography level="captionr" className="text-tertiary opacity-50">
              {new Date(message.createdAt).toLocaleDateString('vi-VN', {
                hour: 'numeric',
                minute: 'numeric',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Typography>
          </Typography>
        </div>
        <Typography level="body2r" className="text-secondary opacity-80">
          {message.text}
        </Typography>
        {/* {message.imageUrl && (
          <Image
            src={message.imageUrl}
            alt="message-image"
            width={500}
            height={500}
            className="max-h-[22.5rem] w-full md: rounded-[1.5rem] object-cover"
          />
        )} */}
      </div>
    </div>
  );
}
