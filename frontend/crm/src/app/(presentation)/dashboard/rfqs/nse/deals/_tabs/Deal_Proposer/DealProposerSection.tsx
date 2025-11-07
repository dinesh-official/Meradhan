"use client";
import { CreateNegotiationResponse } from '@root/apiGateway';
import DealProposerTable from './DealProposerTable';

function DealProposerSection({data,loading}:{  data: CreateNegotiationResponse[];
  loading?: boolean;}) {

  return (
    <div>
      <DealProposerTable data={data||[]} loading={loading} />
    </div>
  )
}

export default DealProposerSection