/* eslint-disable @typescript-eslint/no-explicit-any */
import { Typography } from "@/components/typography";
import { INftActivity } from "@/interfaces/nft";

export const OfferItem = ({
  offer,
  isUserOffer,
  onEdit,
}: {
  offer: INftActivity;
  isUserOffer: boolean;
  onEdit: (offerId: string, price: number) => void;
}) => (
  <div className="bg-neutral2-5 p-4 rounded-lg shadow-card hover:shadow-wrapper transition-all duration-300">
    <div className="flex justify-between items-center mb-2">
      <Typography level="baser" className="text-gray-100">
        {offer.from?.username || 'Anonymous User'}
      </Typography>
      <Typography level="baser" className="text-gray-100 font-semibold">
        {offer.price || 0} INK
      </Typography>
    </div>
    <div className="flex justify-between items-center">
      <Typography level="base2r" className="text-gray-400">
        {new Date(offer.createdAt).toLocaleDateString()}
      </Typography>
      {isUserOffer && (
        <button
          onClick={() => onEdit(offer.id, offer.price || 0)}
          className="text-blue-400 hover:text-blue-600 text-sm"
        >
          Edit Offer
        </button>
      )}
    </div>
  </div>
);

export const BidItem = ({ activity }: { activity:  INftActivity }) => (
  <div className="bg-neutral2-5 p-4 rounded-lg shadow-card hover:shadow-wrapper transition-all duration-300">
    <div className="flex justify-between items-center mb-2">
      <Typography level="baser" className="text-gray-100">
        {activity.from?.username || 'Anonymous User'}
      </Typography>
      <Typography level="baser" className="text-gray-100 font-semibold">
        {activity.price || 0} INK
      </Typography>
    </div>
    <div className="flex justify-between items-center">
      <Typography level="base2r" className="text-gray-400">
        {`${activity.from?.address.slice(0, 8)}...${activity.from?.address.slice(-8)}` || '0x0000000...00000000'}
      </Typography>
      <Typography level="base2r" className="text-gray-400">
        {new Date(activity.createdAt).toLocaleDateString()}
      </Typography>
    </div>
  </div>
);