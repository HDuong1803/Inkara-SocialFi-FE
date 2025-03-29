import { EmptyContent } from '@/components/empty-content';
import { Typography } from '@/components/typography';

export default function Custom404() {
  return (
    <EmptyContent
      content={
        <Typography level="base2sm" className="text-secondary">
          404 - Page Not Found
        </Typography>
      }
      image="/svg/ai_data_consolidation.svg"
    />
  );
}
