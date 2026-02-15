;; AgentRegistry Contract
;; A registry for AI Agent Identity on Stacks (EIP-8004 inspired)

(impl-trait .traits.agent-registry-trait)

;; Constants
(define-constant ERR-AGENT-NOT-FOUND (err u101))

;; Data Maps
(define-map agents
  principal
  {
    name: (string-ascii 64),
    model: (string-ascii 64),
    description: (string-ascii 256),
    creator: principal,
    created-at: uint,
    active: bool,
  }
)

;; Public Functions

(define-public (register-agent
    (name (string-ascii 64))
    (model (string-ascii 64))
    (description (string-ascii 256))
  )
  (begin
    (map-set agents tx-sender {
      name: name,
      model: model,
      description: description,
      creator: tx-sender,
      created-at: block-height,
      active: true,
    })
    (print {
      event: "agent-registered",
      agent: tx-sender,
      name: name,
      model: model,
    })
    (ok true)
  )
)

(define-public (update-agent
    (name (string-ascii 64))
    (model (string-ascii 64))
    (description (string-ascii 256))
    (active bool)
  )
  (let ((agent (unwrap! (map-get? agents tx-sender) ERR-AGENT-NOT-FOUND)))
    (map-set agents tx-sender
      (merge agent {
        name: name,
        model: model,
        description: description,
        active: active,
      })
    )
    (print {
      event: "agent-updated",
      agent: tx-sender,
      name: name,
      active: active,
    })
    (ok true)
  )
)

;; Read Only Functions

(define-read-only (get-agent (agent-address principal))
  (ok (map-get? agents agent-address))
)
