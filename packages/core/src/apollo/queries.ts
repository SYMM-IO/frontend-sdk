import gql from "graphql-tag";

export const ORDER_HISTORY_DATA = gql`
  query OrderHistory($address: String!, $first: Int!, $skip: Int!) {
    resultEntities(
      first: $first
      skip: $skip
      orderBy: timeStamp
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
      timeStamp
      closePrice
      deadline
      partyBsWhiteList
      symbolId
      fillAmount
      marketPrice
      averageClosedPrice
      liquidateAmount
      liquidatePrice
      closedAmount
      initialData {
        cva
        lf
        partyAmm
        partyBmm
        timeStamp
      }
    }
  }
`;

export const BALANCE_CHANGES_DATA = gql`
  query BalanceChanges($account: String!, $first: Int!, $skip: Int!) {
    balanceChanges(
      where: { account: $account, type_not: "ALLOCATE_PARTY_A" }
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
  query TotalDepositsAndWithdrawals($id: String!) {
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
  query GetPaidAmount($id: String!) {
    resultEntities(where: { quoteId: $id }) {
      fee
    }
  }
`;
