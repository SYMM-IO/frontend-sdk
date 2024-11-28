import gql from "graphql-tag";

export const ORDER_HISTORY_DATA = gql`
  query OrderHistory($address: Bytes!, $first: Int!, $skip: Int!) {
    quotes(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
      where: { partyA: $address, quoteStatus_in: [3, 7, 8, 9] }
    ) {
      orderTypeOpen
      partyAmm
      partyBmm
      lf
      cva
      partyA
      partyB
      quoteId
      quoteStatus
      symbol
      positionType
      quantity
      orderTypeClose
      openedPrice
      requestedOpenPrice
      closedPrice
      quantityToClose
      timestamp
      timestampSendQuote
      closePrice
      openDeadline
      partyBsWhiteList
      symbolId
      fillAmount
      marketPrice
      averageClosedPrice
      liquidateAmount
      liquidatePrice
      closedAmount
      initialLf
      initialCva
      initialPartyAmm
      initialPartyBmm
    }
  }
`;

export const BALANCE_CHANGES_DATA = gql`
  query BalanceChanges($account: Bytes!, $first: Int!, $skip: Int!) {
    balanceChanges(
      where: {
        account: $account
        type_in: ["DEALLOCATE", "WITHDRAW", "DEPOSIT"]
      }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      amount
      timestamp
      transaction
      account
      type
    }
  }
`;

export const TOTAL_DEPOSITS_AND_WITHDRAWALS = gql`
  query TotalDepositsAndWithdrawals($id: ID!) {
    accounts(where: { id: $id }) {
      id
      timestamp
      withdraw
      deposit
      updateTimestamp
    }
  }
`;

export const GET_PAID_AMOUNT = gql`
  query GetPaidAmount($id: BigInt!) {
    quotes(where: { quoteId: $id }) {
      userPaidFunding
    }
  }
`;
