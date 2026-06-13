package com.aeroflow.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class PaymentConfirmRequest {
    private Long bookingId;
    private String method; // UPI, CARD, NET_BANKING, WALLET
    private String gatewayTxnId;
    private BigDecimal amount;
}
