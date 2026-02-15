;; ArenaPlatform Contract
;; 1v1 Wagering platform for AI Agents and Players on Stacks

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-MATCH-NOT-FOUND (err u101))
(define-constant ERR-MATCH-NOT-ACTIVE (err u102))
(define-constant ERR-INVALID-WAGER (err u103))
(define-constant ERR-INVALID-MOVE (err u104))
(define-constant ERR-ALREADY-PLAYED (err u105))

;; Status Constants
(define-constant STATUS-PROPOSED u0)
(define-constant STATUS-ACCEPTED u1)
(define-constant STATUS-COMPLETED u2)

;; Game Type Constants
(define-constant GAME-RPS u0)

;; Constants for platform settings
(define-constant platform-fee-percent u2)
(define-constant platform-treasury 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM) ;; Standard test treasury

;; Data Vars
(define-data-var match-counter uint u0)

;; Data Maps
(define-map matches
  uint
  {
    id: uint,
    challenger: principal,
    opponent: (optional principal),
    wager: uint,
    game-type: uint,
    status: uint,
    winner: (optional principal),
    created-at: uint,
  }
)

(define-map player-moves
  {
    match-id: uint,
    player: principal,
  }
  uint
)
(define-map has-played
  {
    match-id: uint,
    player: principal,
  }
  bool
)

;; Public Functions

(define-public (propose-match
    (opponent (optional principal))
    (game-type uint)
    (wager uint)
  )
  (let ((match-id (var-get match-counter)))
    (asserts! (> wager u0) ERR-INVALID-WAGER)
    (try! (stx-transfer? wager tx-sender (as-contract tx-sender)))

    (map-set matches match-id {
      id: match-id,
      challenger: tx-sender,
      opponent: opponent,
      wager: wager,
      game-type: game-type,
      status: STATUS-PROPOSED,
      winner: none,
      created-at: block-height,
    })

    (var-set match-counter (+ match-id u1))
    (print {
      event: "match-proposed",
      match-id: match-id,
      challenger: tx-sender,
      opponent: opponent,
      wager: wager,
      game-type: game-type,
    })
    (ok match-id)
  )
)

(define-public (accept-match (match-id uint))
  (let ((match-data (unwrap! (map-get? matches match-id) ERR-MATCH-NOT-FOUND)))
    (asserts! (is-eq (get status match-data) STATUS-PROPOSED) ERR-MATCH-NOT-ACTIVE)
    (asserts!
      (or (is-none (get opponent match-data)) (is-eq (get opponent match-data) (some tx-sender)))
      ERR-NOT-AUTHORIZED
    )

    (try! (stx-transfer? (get wager match-data) tx-sender (as-contract tx-sender)))

    (map-set matches match-id
      (merge match-data {
        opponent: (some tx-sender),
        status: STATUS-ACCEPTED,
      })
    )

    (print {
      event: "match-accepted",
      match-id: match-id,
      opponent: tx-sender,
    })
    (ok true)
  )
)

(define-public (play-move
    (match-id uint)
    (move uint)
  )
  (let ((match-data (unwrap! (map-get? matches match-id) ERR-MATCH-NOT-FOUND)))
    (asserts! (is-eq (get status match-data) STATUS-ACCEPTED) ERR-MATCH-NOT-ACTIVE)
    (asserts!
      (or (is-eq tx-sender (get challenger match-data)) (is-eq (some tx-sender) (get opponent match-data)))
      ERR-NOT-AUTHORIZED
    )
    (asserts!
      (is-none (map-get? has-played {
        match-id: match-id,
        player: tx-sender,
      }))
      ERR-ALREADY-PLAYED
    )

    ;; Simple validation based on game type
    (if (is-eq (get game-type match-data) GAME-RPS)
      (asserts! (< move u3) ERR-INVALID-MOVE)
      true
    )

    (map-set player-moves {
      match-id: match-id,
      player: tx-sender,
    }
      move
    )
    (map-set has-played {
      match-id: match-id,
      player: tx-sender,
    }
      true
    )

    (print {
      event: "move-played",
      match-id: match-id,
      player: tx-sender,
      move: move,
    })
    (ok true)
  )
)

(define-public (resolve-match
    (match-id uint)
    (winner principal)
  )
  (let (
      (match-data (unwrap! (map-get? matches match-id) ERR-MATCH-NOT-FOUND))
      (total-pool (* (get wager match-data) u2))
      (fee (/ (* total-pool platform-fee-percent) u100))
      (prize (- total-pool fee))
    )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status match-data) STATUS-ACCEPTED) ERR-MATCH-NOT-ACTIVE)
    (asserts!
      (or (is-eq winner (get challenger match-data)) (is-eq (some winner) (get opponent match-data)))
      ERR-NOT-AUTHORIZED
    )

    (try! (as-contract (stx-transfer? fee tx-sender platform-treasury)))
    (try! (as-contract (stx-transfer? prize tx-sender winner)))

    (map-set matches match-id
      (merge match-data {
        status: STATUS-COMPLETED,
        winner: (some winner),
      })
    )

    (print {
      event: "match-completed",
      match-id: match-id,
      winner: winner,
      prize: prize,
    })
    (ok true)
  )
)

;; Read Only Functions

(define-read-only (get-match-count)
  (var-get match-counter)
)

(define-read-only (get-match-details (match-id uint))
  (map-get? matches match-id)
)

(define-read-only (get-player-move
    (match-id uint)
    (player principal)
  )
  (map-get? player-moves {
    match-id: match-id,
    player: player,
  })
)
