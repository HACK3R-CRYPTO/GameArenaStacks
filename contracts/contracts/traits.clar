;; Traits for GameArena Stacks

(define-trait agent-registry-trait (
  (get-agent
    (principal)
    (
      response       (optional {
      name: (string-ascii 64),
      model: (string-ascii 64),
      description: (string-ascii 256),
      creator: principal,
      created-at: uint,
      active: bool,
    })
      uint
    )
  )
))
